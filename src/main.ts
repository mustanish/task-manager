import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as helmet from 'helmet';
import { TransformResponse, ExceptionResponse } from '@taskmanager/responses';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.use(helmet());
  app.useGlobalFilters(new ExceptionResponse());
  app.useGlobalInterceptors(new TransformResponse());
  await app.listen(process.env.SERVER_PORT);
}
bootstrap();
