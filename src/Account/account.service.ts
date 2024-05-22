import { Injectable } from "@nestjs/common";

@Injectable()
export class AccountService {
  public async attempt(username: string): Promise<any> {
    console.log(username)
    return '';
  }
}
