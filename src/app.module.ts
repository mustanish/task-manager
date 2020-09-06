import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from 'nestjs-redis';
import { AppConfig } from './configs/app.config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ServicesModule } from './services/services.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [AppConfig],
    }),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => configService.get('cache'),
      inject: [ConfigService],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) =>
        configService.get('database'),
      inject: [ConfigService],
    }),
    AuthModule,
    UserModule,
    ServicesModule,
  ],
})
export class AppModule {}
