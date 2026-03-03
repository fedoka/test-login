import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Model } from 'mongoose';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}
  async create(createUserDto: CreateUserDto) {
    const user = new this.userModel(createUserDto);
    return await user.save();
  }
  findAll() {
    return this.userModel.find().exec();
  }
  findOneByEmail(email: string) {
    return this.userModel.findOne({ email }).exec();
  }
  async updateUser(email: string, data: object) {
    return await this.userModel
      .findOneAndUpdate({ email }, data, { new: true })
      .exec();
  }
}
