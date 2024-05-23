import { ApiResponse } from './api.response';

export class SuccessResponse extends ApiResponse {
  constructor(data: any = {}, content: string = 'Success.') {
    super(200, content, data);
  }
}
