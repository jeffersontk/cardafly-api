import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createApp, signup } from './test-utils';

describe('Pantry (e2e)', () => {
  let app: INestApplication;
  let token = '';

  beforeAll(async () => {
    app = await createApp();
    ({ token } = await signup(app));
  });

  afterAll(async () => await app.close());

  it('POST /api/pantry -> 201 (create/replace)', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/pantry')
      .set('Authorization', `Bearer ${token}`)
      .send({ item: 'Arroz', unidade: 'g', quantidade: 500 })
      .expect(201);

    expect(res.body.quantidade).toBe(500);
  });

  it('PATCH /api/pantry -> 200 (delta +)', async () => {
    const res = await request(app.getHttpServer())
      .patch('/api/pantry')
      .set('Authorization', `Bearer ${token}`)
      .send({ item: 'Arroz', unidade: 'g', delta: 250 })
      .expect(200);
    expect(res.body.quantidade).toBe(750);
  });

  it('GET /api/pantry -> 200 (list)', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/pantry')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(res.body.some((i: any) => i.item === 'Arroz')).toBe(true);
  });

  it('DELETE /api/pantry -> 200 (remove)', async () => {
    await request(app.getHttpServer())
      .delete('/api/pantry')
      .set('Authorization', `Bearer ${token}`)
      .send({ item: 'Arroz', unidade: 'g' })
      .expect(200);
  });
});
