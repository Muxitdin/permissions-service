import { CheckPayload, CheckResponse, ErrorCode } from "../lib/types";
import { getCachedPermissions, setCachedPermissions } from "../nats/kv";
import { listPermissions } from "../db/queries";
import { logEvent } from "../lib/logger";
export async function handleCheck(payload: CheckPayload): Promise<CheckResponse> {
    logEvent("check:input", payload);
    try {
        let permissions;
        try {
            permissions = await getCachedPermissions(payload.apiKey);
            if (permissions) {
                logEvent("check:cache_hit", { apiKey: payload.apiKey });
            }
        } catch (cacheErr) {
            logEvent("check:cache_error", { apiKey: payload.apiKey, error: cacheErr });
        }

        if (!permissions) {
            try {
                permissions = await listPermissions(payload.apiKey);
                if (!permissions) {
                    logEvent("check:db_empty", { apiKey: payload.apiKey });
                    return {
                        error: {
                            code: ErrorCode.apiKey_not_found,
                            message: "API key not found",
                        },
                    };
                }

                logEvent("check:db_fetched", { apiKey: payload.apiKey, permissions });

                try {
                    await setCachedPermissions(payload.apiKey, permissions);
                    logEvent("check:cache_updated", { apiKey: payload.apiKey });
                } catch (cacheSetError) {
                    logEvent("check:cache_update_failed", {
                        apiKey: payload.apiKey,
                        error: cacheSetError,
                    });
                }
            } catch (dbErr) {
                logEvent("check:db_error", { apiKey: payload.apiKey, error: dbErr });
                return {
                    error: {
                        code: ErrorCode.db_error,
                        message: "Database error",
                    },
                };
            }
        }
        const allowed = permissions.some((p) => p.module === payload.module && p.action === payload.action);
        logEvent("check:result", { apiKey: payload.apiKey, allowed });
        return { allowed };
    } catch (e) {
        logEvent("check:unknown_error", { apiKey: payload.apiKey, error: e });
        return {
            error: {
                code: ErrorCode.unknown_error,
                message: "Unexpected error",
            },
        };
    }
}
