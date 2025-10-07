import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createApp, signupAndLogin } from './test-utils';

describe('Members (e2e)', () => {
  let app: INestApplication;
  let token = '';
  let familyId = '';
  let memberId = '';

  beforeAll(async () => {
    app = await createApp();
    ({ token } = await signupAndLogin(app));

    const mine = await request(app.getHttpServer())
      .get('/api/families/mine')
      .set('Authorization', `Bearer ${token}`);
    familyId = mine.body[0].id;
  });

  afterAll(async () => await app.close());

  it('POST /api/members -> 201', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/members')
      .set('Authorization', `Bearer ${token}`)
      .send({ familyId, name: 'Fulano', genero: 'masculino', idade: 30, peso: 80 })
      .expect(201);

    memberId = res.body.id;
    expect(memberId).toBeDefined();
  });

  it('GET /api/members/family/:familyId -> 200', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/members/family/${familyId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('PATCH /api/members/:id -> 200', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/members/${memberId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ peso: 82 })
      .expect(200);

    expect(res.body.peso).toBe(82);
  });

  it('DELETE /api/members/:id -> 200', async () => {
    await request(app.getHttpServer())
      .delete(`/api/members/${memberId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });
});
