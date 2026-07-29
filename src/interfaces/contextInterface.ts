import { IncomingHttpHeaders } from "http";
import { UserInterface } from "./userInterface";

export interface ContextInterface {
    authorization?: string | undefined;
    operationName?: string;
    user?: UserInterface;
    headers?: IncomingHttpHeaders; 
}