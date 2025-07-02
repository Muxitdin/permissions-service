import { ListPayload, ErrorCode } from "../types";
import { getCachedPermissions, setCachedPermissions } from "../nats/kv";
import { listPermissions } from "../db/queries";
export async function handleList(payload: ListPayload) {
    try {
        let permissions = await getCachedPermissions(payload.apiKey);
        if (!permissions) {
            permissions = await listPermissions(payload.apiKey);
            if (!permissions) {
                return {
                    error: {
                        code: ErrorCode.apiKey_not_found,
                        message: "API key not found",
                    },
                };
            }
            await setCachedPermissions(payload.apiKey, permissions);
        }
        return { permissions };
    } catch (e) {
        return {
            error: {
                code: ErrorCode.unknown_error,
                message: "Unexpected error",
            },
        };
    }
}
