import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors({
    origin: process.env.ALLOW_ORIGINS?.split(',') ?? '*',
  });

  const swaggerCfg = new DocumentBuilder()
    .setTitle('Cardafly API')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const doc = SwaggerModule.createDocument(app, swaggerCfg);
  SwaggerModule.setup('api/docs', app, doc);

  const config = app.get(ConfigService);
  const port = Number(config.get('PORT') ?? 3001);
  const host = (config.get<string>('HOST') ?? '0.0.0.0') as string;



  await app.listen(port, host);

  const displayHost = host === '0.0.0.0' ? 'localhost' : host;
  console.log(
    `🚀 API http://${displayHost}:${port}/api  ·  Docs http://${displayHost}:${port}/api/docs`,
  );
}
bootstrap();
