import { PageInfoInterface } from "../interfaces";

class SuccessResponse {
  static instance: SuccessResponse;

  constructor() {}

  static get(): SuccessResponse {
    if (!SuccessResponse.instance) {
      SuccessResponse.instance = new SuccessResponse();
    }
    return SuccessResponse.instance;
  }

  async send({
    message,
    data,
    edges,
    pageInfo,
    count
  }:{
    message: string,
    data?: Partial<any>,
    edges?: Partial<any>[];
    count?: number;
    pageInfo?: Partial<PageInfoInterface>
  }){
    return {
        message,
        data,
        edges,
        pageInfo,
        count
    }
  }
}

const successResponse = SuccessResponse.get();
export {successResponse as SuccessResponse};