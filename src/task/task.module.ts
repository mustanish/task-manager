import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from '@taskmanager/entities';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { ServicesModule } from '../services/services.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Task]), AuthModule, ServicesModule],
  controllers: [TaskController],
  providers: [TaskService],
})
export class TaskModule {}
