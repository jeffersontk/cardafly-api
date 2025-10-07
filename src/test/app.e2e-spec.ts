// src/test/app.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';

describe('Auth + Families (e2e)', () => {
  let app: INestApplication;
  let token = '';
  const email = `e2e${Date.now()}@mail.com`;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // >>> REPLICA DO main.ts <<<
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /api/auth/signup -> 201, returns access_token', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/signup')
      .send({
        firstname: 'E2E',
        lastname: 'Tester',
        email,
        password: 'P@ssw0rd',
      })
      .expect(201);

    expect(res.body?.access_token).toBeDefined();
    token = res.body.access_token;
  });

  it('GET /api/families/mine -> 200, returns at least one family', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/families/mine')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });
});
