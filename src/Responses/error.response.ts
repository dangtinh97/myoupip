import { ApiResponse } from './api.response';

export class ErrorResponse extends ApiResponse {
  constructor(status: number, content: string) {
    super(status, content, {});
  }
}
