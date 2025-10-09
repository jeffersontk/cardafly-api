import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../app.module';
import request from 'supertest';

export async function createApp(): Promise<INestApplication> {
  const mod = await Test.createTestingModule({ imports: [AppModule] }).compile();
  const app = mod.createNestApplication();
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));
  await app.init();
  return app;
}

export const randEmail = (p = 'e2e') =>
  `${p}+${Date.now()}_${Math.random().toString(36).slice(2, 8)}@mail.com`;

export const bearer = (token: string) => ({ Authorization: `Bearer ${token}` });

export async function signup(
  app: INestApplication,
  payload?: Partial<{ email: string; password: string; firstname: string; lastname: string }>
) {
  const data = {
    email: payload?.email ?? randEmail('user'),
    password: payload?.password ?? 'P@ssw0rd',
    firstname: payload?.firstname ?? 'A',
    lastname: payload?.lastname ?? 'B',
  };
  const res = await request(app.getHttpServer()).post('/api/auth/signup').send(data).expect(201);
  return { token: res.body.access_token as string, email: data.email };
}

export async function login(app: INestApplication, email: string, password = 'P@ssw0rd') {
  const res = await request(app.getHttpServer())
    .post('/api/auth/login')
    .send({ email, password })
    .expect(201);
  return res.body.access_token as string;
}

export async function myFamilies(app: INestApplication, token: string) {
  const res = await request(app.getHttpServer())
    .get('/api/families/mine')
    .set(bearer(token))
    .expect(200);
  return res.body as Array<{ id: string; name: string }>;
}

export async function myFamilyId(app: INestApplication, token: string) {
  const mine = await myFamilies(app, token);
  if (mine?.length) return mine[0].id;

  const created = await request(app.getHttpServer())
    .post('/api/families')
    .set(bearer(token))
    .send({ name: `Family ${Date.now()}` })
    .expect(201);

  return created.body.id as string;
}
