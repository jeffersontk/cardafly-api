import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createApp, signup, myFamilyId, bearer } from './test-utils';

describe('Pantry (CRUD) e2e', () => {
  let app: INestApplication;
  let token = '';
  let familyId = '';

  beforeAll(async () => {
    app = await createApp();
    ({ token } = await signup(app));
    familyId = await myFamilyId(app, token);
  });

  afterAll(async () => await app.close());

  it('POST /api/pantry -> 201 (cria/atualiza)', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/pantry')
      .set(bearer(token))
      .send([
        { familyId, item: 'Arroz', unidade: 'kg', quantidade: 2, brand: 'Tio' },
        { familyId, item: 'Feijao', unidade: 'kg', quantidade: 1 },
      ])
      .expect(201);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/pantry -> 200', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/pantry')
      .set(bearer(token))
      .expect(200);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  it('PATCH /api/pantry -> 200', async () => {
    const res = await request(app.getHttpServer())
      .patch('/api/pantry')
      .set(bearer(token))
      .send([{ item: 'Arroz', unidade: 'kg', brand: 'Tio', quantidade: 3 }])
      .expect(200);
    expect(res.body.find((i: any) => i.item === 'Arroz')?.quantidade).toBe(3);
  });

  it('DELETE /api/pantry -> 200', async () => {
    await request(app.getHttpServer())
      .delete('/api/pantry')
      .set(bearer(token))
      .send([{ item: 'Feijao', unidade: 'kg' }])
      .expect(200);
  });
});
