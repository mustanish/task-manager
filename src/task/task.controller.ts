import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { User } from '@taskmanager/entities';
import { TaskRequest } from '@taskmanager/requests';
import { PaginationResponse, TaskResponse } from '@taskmanager/responses';
import { TaskStatusValidation } from '@taskmanager/pipes';
import { TaskStatus } from '@taskmanager/enums';
import { TaskService } from './task.service';
import { UserDetail } from '../user/user.decorator';
import { JwtGuard } from '../auth/jwt.guard';

@Controller('task')
@UseGuards(JwtGuard)
export class TaskController {
  constructor(private taskService: TaskService) {}
  @Post('/')
  createTask(
    @UserDetail() user: User,
    @Body(ValidationPipe) request: TaskRequest,
  ): Promise<PaginationResponse<TaskResponse>> {
    return this.taskService.createTask(user, request);
  }

  @Patch('/:taskID')
  updateTask(
    @UserDetail() user: User,
    @Body(ValidationPipe) request: TaskRequest,
    @Param('taskID', ParseUUIDPipe) taskID: string,
  ): Promise<PaginationResponse<TaskResponse>> {
    return this.taskService.updateTask(user, request, taskID);
  }

  @Delete('/:taskID')
  deleteTask(
    @UserDetail() user: User,
    @Param('taskID', ParseUUIDPipe) taskID: string,
  ): Promise<PaginationResponse<TaskResponse>> {
    return this.taskService.deleteTask(user, taskID);
  }

  @Get('/:taskID')
  getTask(
    @UserDetail() user: User,
    @Param('taskID', ParseUUIDPipe) taskID: string,
  ): Promise<TaskResponse> {
    return this.taskService.getTask(user, taskID);
  }

  @Get('/')
  getTasks(
    @UserDetail() user: User,
    @Query('status', TaskStatusValidation) status: TaskStatus,
    @Query('searchString') searchString: string,
  ): Promise<PaginationResponse<TaskResponse>> {
    return this.taskService.getTasks(user, status, searchString);
  }
}
