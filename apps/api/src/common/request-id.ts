import type { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'node:crypto';

export const REQUEST_ID_HEADER = 'x-request-id';

// Client-supplied IDs are accepted only when they are short and log-safe.
const REQUEST_ID_PATTERN = /^[A-Za-z0-9._-]{1,64}$/;

/** True when a value is an acceptable request ID. */
export function isRequestId(value: unknown): value is string {
  return typeof value === 'string' && REQUEST_ID_PATTERN.test(value);
}

/** Returns the validated client request ID, or a new UUID. */
export function resolveRequestId(request: Request): string {
  const incoming = request.header(REQUEST_ID_HEADER);
  return isRequestId(incoming) ? incoming : randomUUID();
}

/** Adds a request ID to every response, including successful ones. */
export function requestIdMiddleware(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  response.setHeader(REQUEST_ID_HEADER, resolveRequestId(request));
  next();
}
