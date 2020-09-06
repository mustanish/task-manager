import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from '@groome/entities';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), AuthModule],
  exports: [UserService],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}
