import { ErrorCode, ErrorResponse } from "./types";

export function makeErrorResponse(code: ErrorCode, message: string): ErrorResponse {
    return {
        error: {
            code,
            message,
        },
    };
}
