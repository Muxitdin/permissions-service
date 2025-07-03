import { grantPermission, listPermissions } from "../db/queries";
import { GrantPayload, ErrorCode, GrantResponse } from "../lib/types";
import { makeErrorResponse } from "../lib/utils";
import { setCachedPermissions } from "../nats/kv";
import { logEvent } from "../lib/logger";

export async function handleGrant(payload: GrantPayload): Promise<GrantResponse> {
    logEvent("grant:input", payload);

    try {
        await grantPermission(payload.apiKey, payload.module, payload.action);
        logEvent("grant:db_success", payload);

        const updated = await listPermissions(payload.apiKey);
        logEvent("grant:db_fetch_updated", { apiKey: payload.apiKey, permissions: updated });

        try {
            await setCachedPermissions(payload.apiKey, updated);
            logEvent("grant:cache_updated", { apiKey: payload.apiKey });
        } catch (cacheErr) {
            logEvent("grant:cache_update_failed", { apiKey: payload.apiKey, error: cacheErr });
        }

        return { status: "ok" };
    } catch (e) {
        logEvent("grant:db_error", { error: e });
        return makeErrorResponse(ErrorCode.db_error, "Database error");
    }
}
