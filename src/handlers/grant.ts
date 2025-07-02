import { grantPermission, listPermissions } from "../db/queries";
import { GrantPayload, ErrorCode } from "../types";
import { setCachedPermissions } from "../nats/kv";
export async function handleGrant(payload: GrantPayload) {
    try {
        await grantPermission(payload.apiKey, payload.module, payload.action);
        const updated = await listPermissions(payload.apiKey);
        await setCachedPermissions(payload.apiKey, updated);
        return { status: "ok" };
    } catch (e) {
        return {
            error: { code: ErrorCode.db_error, message: "Database error" },
        };
    }
}
