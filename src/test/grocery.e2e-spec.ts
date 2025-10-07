import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createApp, signupAndLogin } from './test-utils';

describe('Grocery (e2e)', () => {
  let app: INestApplication;
  let token = '';
  let weekStart = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  let listId = '';

  beforeAll(async () => {
    app = await createApp();
    ({ token } = await signupAndLogin(app));
  });

  afterAll(async () => await app.close());

  it('PUT /api/grocery -> 200 (upsert items for week)', async () => {
    const res = await request(app.getHttpServer())
      .put('/api/grocery')
      .set('Authorization', `Bearer ${token}`)
      .send({
        weekStart,
        items: [
          { name: 'Leite', brand: 'X', unidade: 'un', quantidade: 2 },
          { name: 'Detergente', unidade: 'un', quantidade: 1 }
        ],
      })
      .expect(200);

    listId = res.body.id;
    expect(res.body.items.length).toBe(2);
  });

  it('GET /api/grocery?weekStart=... -> 200', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/grocery?weekStart=${weekStart}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(res.body?.id).toBe(listId);
  });
});
