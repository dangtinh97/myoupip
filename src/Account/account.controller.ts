import { Controller, Post, Req } from '@nestjs/common';
import { AccountService } from './account.service';

@Controller()
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post('/login')
  async attempt(@Req() request: Request): Promise<any> {
    const service = await this.accountService.attempt(
      request.body['username'] ?? '',
    );
    return service.json();
  }
}
