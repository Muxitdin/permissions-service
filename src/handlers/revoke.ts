import { revokePermission, listPermissions } from "../db/queries";
import { RevokePayload, ErrorCode, RevokeResponse } from "../lib/types";
import { makeErrorResponse } from "../lib/utils";
import { setCachedPermissions } from "../nats/kv";
import { logEvent } from "../lib/logger";

export async function handleRevoke(payload: RevokePayload): Promise<RevokeResponse> {
    logEvent("revoke:input", payload);

    try {
        await revokePermission(payload.apiKey, payload.module, payload.action);
        logEvent("revoke:db_success", payload);

        const updated = await listPermissions(payload.apiKey);
        logEvent("revoke:db_fetch_updated", { apiKey: payload.apiKey, permissions: updated });

        try {
            await setCachedPermissions(payload.apiKey, updated);
            logEvent("revoke:cache_updated", { apiKey: payload.apiKey });
        } catch (cacheErr) {
            logEvent("revoke:cache_update_failed", { apiKey: payload.apiKey, error: cacheErr });
        }

        return { status: "ok" };
    } catch (e) {
        logEvent("revoke:db_error", { error: e });
        return makeErrorResponse(ErrorCode.db_error, "Database error");
    }
}
