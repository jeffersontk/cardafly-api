// src/test/test-utils.ts
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../app.module';

export async function createApp(): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  const app = moduleRef.createNestApplication();
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.init();
  return app;
}

export async function signupAndLogin(app: INestApplication, email?: string) {
  const e = email ?? `e2e_${Date.now()}@mail.com`;
  const pwd = 'P@ssw0rd';

  await request(app.getHttpServer())
    .post('/api/auth/signup')
    .send({ firstname: 'E2E', lastname: 'Tester', email: e, password: pwd })
    .expect(201);

  const res = await request(app.getHttpServer())
    .post('/api/auth/login')
    .send({ email: e, password: pwd })
    .expect(201);

  const token = res.body?.access_token as string;
  return { email: e, password: pwd, token };
}
