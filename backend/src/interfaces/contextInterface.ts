import { IncomingHttpHeaders } from "http";
import { Logger } from "pino";
import { AuthTokenPayload } from "./authInterface";

export interface ContextInterface {
    authorization?: string | undefined;
    operationName?: string;
    user?: AuthTokenPayload;
    headers?: IncomingHttpHeaders;
    ip?: string;
    // Per-request child logger (pino-http, see server.ts) - already tagged
    // with this request's id, so call sites don't need to pass the id
    // separately. Optional so tests can build a ContextInterface without one.
    logger?: Logger;
    requestId?: string;
}