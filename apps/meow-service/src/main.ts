import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { CatDto } from './cats/dto/cat.dto';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global filters
  app.useGlobalFilters(new PrismaExceptionFilter());

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // enable class-transformer
      whitelist: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Meow Service')
    .setDescription('The meow service API description')
    .setVersion('1.0')
    .addTag('meow')
    .build();
  const documentFactory = () =>
    SwaggerModule.createDocument(app, config, {
      extraModels: [CatDto],
    });
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
