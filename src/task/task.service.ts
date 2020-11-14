import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Task, User } from '@taskmanager/entities';
import { TaskRequest } from '@taskmanager/requests';
import { TaskStatus, ErrorCode } from '@taskmanager/enums';
import { InjectRepository } from '@nestjs/typeorm';
import {
  TaskResponse,
  paginate,
  PaginationResponse,
} from '@taskmanager/responses';
import { Unavailable, InvalidTask, UniqueTask } from '@taskmanager/constants';
import { timeNow } from '@taskmanager/utils';
import { CacheService } from '../services/cache.service';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    private cacheService: CacheService,
  ) {}

  async createTask(
    user: User,
    request: TaskRequest,
  ): Promise<PaginationResponse<TaskResponse>> {
    try {
      const task = await this.taskRepository.create(request);
      await this.taskRepository.save({ ...task, user });
      this.cacheService.delete(`${user.id}::tasks`)
      return this.getTasks(user);
    } catch (error) {
      if (error.code === ErrorCode.UNIQUE)
        throw new HttpException(UniqueTask, HttpStatus.BAD_REQUEST);
      throw new HttpException(Unavailable, HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  async updateTask(
    user: User,
    request: TaskRequest,
    taskID: string,
  ): Promise<PaginationResponse<TaskResponse>> {
    try {
      const task = await this.getTask(user, taskID);
      await this.taskRepository.save({ ...task, ...request });
      this.cacheService.delete(`${user.id}::tasks`)
      return this.getTasks(user);
    } catch (error) {
      if (error.status === HttpStatus.BAD_REQUEST)
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      throw new HttpException(Unavailable, HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  async deleteTask(
    user: User,
    taskID: string,
  ): Promise<PaginationResponse<TaskResponse>> {
    try {
      const task = await this.getTask(user, taskID);
      await this.taskRepository.save({
        ...task,
        deleted: true,
        deletedAt: timeNow(),
      });
      this.cacheService.delete(`${user.id}::tasks`)
      return this.getTasks(user);
    } catch (error) {
      if (error.status === HttpStatus.BAD_REQUEST)
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      throw new HttpException(Unavailable, HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  async getTask({ id }: User, taskID: string): Promise<TaskResponse> {
    try {
      const query = this.taskRepository.createQueryBuilder('task');
      query.where(`task.id=:taskID AND task.userId=:userID`, {
        taskID,
        userID: id,
      });
      const task = (await query.getOne()).task();
      if (!task) {
        throw new HttpException(InvalidTask, HttpStatus.BAD_REQUEST);
      }
      return task;
    } catch (error) {
      if (error.status === HttpStatus.BAD_REQUEST)
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      throw new HttpException(Unavailable, HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  async getTasks(
    { id }: User,
    status: TaskStatus = null,
    searchString: string = null,
    currentPage: number = 1,
    perPage: number = 10,
  ): Promise<PaginationResponse<TaskResponse>> {
    try {
      const query = this.taskRepository.createQueryBuilder('task');
      query.where(`task.userId=:userID`, { userID: id });
      if (status) {
        query.andWhere('task.status = :status', { status });
      }
      if (searchString) {
        query.andWhere(`task.searchDocument @@ to_tsquery(:searchString)`, {
          searchString,
        });
      }
      query
        .orderBy('task.createdAt', 'DESC')
        .offset((currentPage - 1) * perPage)
        .limit(perPage);
      const [tasks, totalItems] = await query.getManyAndCount();
      return paginate<TaskResponse>(
        tasks.map(task => task.task()),
        totalItems,
        currentPage,
        perPage,
      );
    } catch (error) {
      throw new HttpException(Unavailable, HttpStatus.SERVICE_UNAVAILABLE);
    }
  }
}
