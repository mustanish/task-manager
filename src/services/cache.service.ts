import { Injectable } from '@nestjs/common';
import { RedisService } from 'nestjs-redis';

@Injectable()
export class CacheService {
  private client;
  constructor(private redisService: RedisService) {
    this.client = this.redisService.getClient().del;
  }

  async set<T>(key: string, value: T, expiration?: number): Promise<void> {
    try {
      return await this.client.set(
        key,
        JSON.stringify(value),
        'EX',
        expiration,
      );
    } catch (error) {
      console.log(error);
    }
  }

  async get<T>(key: string): Promise<T> {
    try {
      const data: string = await this.client.get(key);
      return JSON.parse(data);
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      return await this.client.del(key);
    } catch (error) {
      console.log(error);
    }
  }
}
