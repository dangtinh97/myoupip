import { Injectable } from '@nestjs/common';
import { SuccessResponse } from '../Responses/success.response';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { InjectModel as NestInjectModel } from '@nestjs/mongoose/dist/common/mongoose.decorators';

@Injectable()
export class AccountService {
  constructor(
    @NestInjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  public async attempt(username: string): Promise<any> {
    let find = await this.userModel.findOne({
      username: username,
    });
    if (find) {
      return new SuccessResponse({
        token: '',
        username: find.username,
        full_name: '',
        short_name: '',
      });
    }

    await this.userModel.create({
      username: username,
    });
    return new SuccessResponse({
      token: '',
      username: username,
      full_name: '',
      short_name: '',
    });
  }
}
