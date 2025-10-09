import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createApp, signup, bearer } from './test-utils';

describe('Grocery (week) e2e', () => {
  let app: INestApplication;
  let token = '';
  const weekStart = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  beforeAll(async () => {
    app = await createApp();
    ({ token } = await signup(app));
  });

  afterAll(async () => await app.close());

  it('PUT /api/grocery -> 200 (upsert por semana)', async () => {
    const res = await request(app.getHttpServer())
      .put('/api/grocery')
      .set(bearer(token))
      .send({
        weekStart,
        items: [
          { name: 'Banana', unidade: 'un', quantidade: 6 },
          { name: 'Maçã', unidade: 'un', quantidade: 4 },
        ],
      })
      .expect(200);
    expect(Array.isArray(res.body.items)).toBe(true);
  });

  it('GET /api/grocery?weekStart=YYYY-MM-DD -> 200', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/grocery?weekStart=${weekStart}`)
      .set(bearer(token))
      .expect(200);
    expect(res.body?.items?.length).toBeGreaterThanOrEqual(1);
  });
});
