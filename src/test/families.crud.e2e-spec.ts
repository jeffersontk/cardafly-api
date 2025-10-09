import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createApp, myFamilyId, signup } from './test-utils';

describe('Families (read) e2e', () => {
  let app: INestApplication;
  let token: string;
  let familyId: string;

  beforeAll(async () => {
    app = await createApp();
    ({ token } = await signup(app));
    familyId = await myFamilyId(app, token);
  });

  afterAll(async () => await app.close());

  it('GET /api/families/mine -> 200 (ao menos uma)', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/families/mine')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  it('GET /api/families -> 200 (lista geral / do usuário)', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/families')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/families/:id -> 200', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/families/${familyId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(res.body?.id).toBe(familyId);
  });
});
