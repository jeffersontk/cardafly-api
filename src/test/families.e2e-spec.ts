import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createApp, signup } from './test-utils';

describe('Families (e2e)', () => {
  let app: INestApplication;
  let token = '';

  beforeAll(async () => {
    app = await createApp();
    ({ token } = await signup(app));
  });


  afterAll(async () => await app.close());

  it('GET /api/families (all) -> 200', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/families')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /api/families -> 201 (create)', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/families')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: `Nova Familia ${Date.now()}` })
      .expect(201);

    expect(res.body?.id).toBeDefined();
  });

  it('GET /api/families/mine -> 200 (minhas)', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/families/mine')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.length).toBeGreaterThan(0);
  });

  it('PATCH /api/families/:id -> 200 (update)', async () => {
    const list = await request(app.getHttpServer())
      .get('/api/families/mine')
      .set('Authorization', `Bearer ${token}`);
    const id = list.body[0].id as string;

    const res = await request(app.getHttpServer())
      .patch(`/api/families/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: `Renamed ${Date.now()}` })
      .expect(200);

    expect(res.body?.name).toMatch(/Renamed/);
  });
});
