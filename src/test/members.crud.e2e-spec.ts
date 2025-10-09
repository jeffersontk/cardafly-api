import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createApp, signup, myFamilyId, bearer } from './test-utils';

describe('Members (CRUD) e2e', () => {
  let app: INestApplication;
  let token = '';
  let familyId = '';
  let memberId = '';

  beforeAll(async () => {
    app = await createApp();
    ({ token } = await signup(app));
    familyId = await myFamilyId(app, token);
  });

  afterAll(async () => await app.close());

  it('POST /api/members -> 201', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/members')
      .set(bearer(token))
      .send({
        familyId,
        name: 'Fulano',
        genero: 'masculino',
        idade: 30,
        peso: 75.5,
        observacoes: '',
      })
      .expect(201);
    memberId = res.body.id;
  });

  it('GET /api/members/family/:familyId -> 200 (lista)', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/members/family/${familyId}`)
      .set(bearer(token))
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('PATCH /api/members/:id -> 200', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/members/${memberId}`)
      .set(bearer(token))
      .send({ peso: 80 })
      .expect(200);
    expect(res.body.peso).toBe(80);
  });

  it('DELETE /api/members/:id -> 200', async () => {
    await request(app.getHttpServer())
      .delete(`/api/members/${memberId}`)
      .set(bearer(token))
      .expect(200);
  });

  it('PATCH em membro inexistente -> 404', async () => {
    await request(app.getHttpServer())
      .patch(`/api/members/xxxxxxxxxxxxxxxxxxxxxx`)
      .set(bearer(token))
      .send({ peso: 1 })
      .expect(404);
  });
});
