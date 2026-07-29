import { IncomingHttpHeaders } from "http";
import { AuthTokenPayload } from "./authInterface";

export interface ContextInterface {
    authorization?: string | undefined;
    operationName?: string;
    user?: AuthTokenPayload;
    headers?: IncomingHttpHeaders;
    ip?: string;
}