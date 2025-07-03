export interface GrantPayload {
  apiKey: string;
  module: string;
  action: string;
}

export interface RevokePayload extends GrantPayload {}

export interface CheckPayload {
  apiKey: string;
  module: string;
  action: string;
}

export interface ListPayload {
  apiKey: string;
}

export interface Permission {
  module: string;
  action: string;
}

export enum ErrorCode {
  apiKey_not_found = "apiKey_not_found",
  db_error = "db_error",
  cache_error = "cache_error",
  invalid_payload = "invalid_payload",
  unknown_error = "unknown_error",
}

export interface ErrorResponse {
  error: {
    code: ErrorCode;
    message: string;
  };
}

export type GrantResponse = {
  status: "ok";
} | ErrorResponse;

export type RevokeResponse = {
  status: "ok";
} | ErrorResponse;

export type ListResponse = {
  permissions: Permission[];
} | ErrorResponse;

export type CheckResponse = {
  allowed: boolean;
} | ErrorResponse;
