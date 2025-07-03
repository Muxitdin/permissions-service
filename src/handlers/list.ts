import { ListPayload, ErrorCode, ListResponse } from "../lib/types";
import { getCachedPermissions, setCachedPermissions } from "../nats/kv";
import { listPermissions } from "../db/queries";
import { makeErrorResponse } from "../lib/utils";
import { logEvent } from "../lib/logger";

export async function handleList(payload: ListPayload): Promise<ListResponse> {
    logEvent("list:input", payload);

    try {
        let permissions;

        try {
            permissions = await getCachedPermissions(payload.apiKey);
            if (permissions) {
                logEvent("list:cache_hit", { apiKey: payload.apiKey });
            }
        } catch (cacheErr) {
            logEvent("list:cache_error", { apiKey: payload.apiKey, error: cacheErr });
        }

        if (!permissions) {
            try {
                permissions = await listPermissions(payload.apiKey);
                if (!permissions) {
                    logEvent("list:db_empty", { apiKey: payload.apiKey });
                    return makeErrorResponse(ErrorCode.apiKey_not_found, "API key not found");
                }

                logEvent("list:db_fetched", { apiKey: payload.apiKey, permissions });

                try {
                    await setCachedPermissions(payload.apiKey, permissions);
                    logEvent("list:cache_updated", { apiKey: payload.apiKey });
                } catch (cacheSetError) {
                    logEvent("list:cache_update_failed", {
                        apiKey: payload.apiKey,
                        error: cacheSetError,
                    });
                }
            } catch (dbErr) {
                logEvent("list:db_error", { apiKey: payload.apiKey, error: dbErr });
                return makeErrorResponse(ErrorCode.db_error, "Database error");
            }
        }

        logEvent("list:result", { apiKey: payload.apiKey, permissionsCount: permissions.length });

        return { permissions };
    } catch (e) {
        logEvent("list:unknown_error", { apiKey: payload.apiKey, error: e });
        return makeErrorResponse(ErrorCode.unknown_error, "Unexpected error");
    }
}
