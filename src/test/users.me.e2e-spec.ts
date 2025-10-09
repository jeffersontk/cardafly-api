import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createApp, randEmail } from './test-utils';

describe('Auth (negatives) e2e', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createApp();
  });

  afterAll(async () => await app.close());

  it('GET rota protegida sem token -> 401', () =>
    request(app.getHttpServer()).get('/api/families/mine').expect(401));

  it('login inválido -> 401', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: randEmail('nouser'), password: 'nope' })
      .expect(401);
  });

  it('signup com e-mail já usado -> 401/409 (seu serviço lança Unauthorized)', async () => {
    const email = randEmail('dup');
    await request(app.getHttpServer())
      .post('/api/auth/signup')
      .send({ email, password: 'P@ssw0rd', firstname: 'A', lastname: 'B' })
      .expect(201);

    await request(app.getHttpServer())
      .post('/api/auth/signup')
      .send({ email, password: 'P@ssw0rd', firstname: 'A', lastname: 'B' })
      .expect((res) => {
        if (![401, 409].includes(res.status)) throw new Error('esperava 401 ou 409');
      });
  });

  it('token inválido -> 401', () =>
    request(app.getHttpServer())
      .get('/api/families/mine')
      .set('Authorization', 'Bearer invalid.token.here')
      .expect(401));
});
