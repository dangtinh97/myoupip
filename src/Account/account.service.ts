import { Injectable } from '@nestjs/common';
import { SuccessResponse } from '../Responses/success.response';

@Injectable()
export class AccountService {
  public async attempt(username: string): Promise<any> {
    console.log(username);
    return new SuccessResponse({
      token: '',
      username: '',
      full_name: '',
      short_name: '',
    });
  }
}
