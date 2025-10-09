// src/test/invitations.flow.e2e-spec.ts
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createApp, myFamilyId, randEmail, signup } from './test-utils';

describe('Invitations (flow) e2e', () => {
  let app: INestApplication;
  let tokenOwner = '';
  let tokenGuest = '';
  let familyId = '';
  const guestEmail = randEmail('guest');
  let inviteId = '';
  let inviteCode = '';

  beforeAll(async () => {
    // Usa o helper que já faz app.setGlobalPrefix('api') e registra ValidationPipe
    app = await createApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('owner signup + pega family', async () => {
    ({ token: tokenOwner } = await signup(app, { firstname: 'Owner', lastname: 'One' }));
    familyId = await myFamilyId(app, tokenOwner);
    expect(familyId).toBeTruthy();
  });

  it('POST /api/invitations -> 201 (gera convite)', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/invitations')
      .set('Authorization', `Bearer ${tokenOwner}`)
      .send({ email: guestEmail }) // role default MEMBER
      .expect(201);

    inviteId = res.body.id;
    inviteCode = res.body.code;
    expect(inviteId).toBeTruthy();
    expect(inviteCode).toBeTruthy();
  });

  it('GET /api/invitations -> 200 (lista inclui o convite)', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/invitations')
      .set('Authorization', `Bearer ${tokenOwner}`)
      .expect(200);

    expect(res.body.some((i: any) => i.id === inviteId)).toBe(true);
  });

  it('guest signup + aceita convite -> 201', async () => {
    ({ token: tokenGuest } = await signup(app, { email: guestEmail, firstname: 'Guest', lastname: 'Two' }));
    await request(app.getHttpServer())
      .post('/api/invitations/accept')
      .set('Authorization', `Bearer ${tokenGuest}`)
      .send({ code: inviteCode })
      .expect(201);
  });

  it('guest vê família do owner em /families/mine -> 200', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/families/mine')
      .set('Authorization', `Bearer ${tokenGuest}`)
      .expect(200);

    expect(res.body.some((f: any) => f.id === familyId)).toBe(true);
  });
});