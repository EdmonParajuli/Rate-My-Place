import { IncomingHttpHeaders } from "http";

export interface ContextInterface {
    authorization?: string | undefined;
    operationName?: string;
    secret?: string;
    headers?: IncomingHttpHeaders; 
}