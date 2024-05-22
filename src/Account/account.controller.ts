import { Controller, Get, Post, Req } from '@nestjs/common';
import { AccountService } from './account.service';

@Controller()
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post('/login')
  attempt(@Req() request: Request): any {
    this.accountService.attempt(request.body['username'] ?? '');
    return '123';
  }
}
