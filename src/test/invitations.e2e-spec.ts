import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createApp, signup, myFamilyId, bearer, randEmail } from './test-utils';

describe('Invitations (e2e)', () => {
  let app: INestApplication;
  let tokenOwner = '';
  let tokenGuest = '';
  let inviteCode = '';
  let familyId = '';

  beforeAll(async () => {
    app = await createApp();

    // signup owner
    ({ token: tokenOwner } = await signup(app, {
      email: `owner_${Date.now()}@mail.com`,
      firstname: 'Owner',
      lastname: 'Fam',
    }));

    // pega (ou cria) family do owner
    familyId = await myFamilyId(app, tokenOwner);

    // signup guest
    const guestEmail = `guest_${Date.now()}@mail.com`;
    ({ token: tokenGuest } = await signup(app, {
      email: guestEmail,
      firstname: 'Guest',
      lastname: 'Solo',
    }));

    // owner cria convite para guest
    const res = await request(app.getHttpServer())
      .post('/api/invitations')
      .set(bearer(tokenOwner))
      .send({ email: guestEmail }) // default role MEMBER
      .expect(201);

    inviteCode = res.body.code;
  });

  afterAll(async () => await app.close());

  it('GET /api/invitations -> lista convites da família', async () => {
    const r = await request(app.getHttpServer())
      .get('/api/invitations')
      .set(bearer(tokenOwner))
      .expect(200);

    expect(Array.isArray(r.body)).toBe(true);
    expect(r.body[0].familyId).toBe(familyId);
  });

  it('POST /api/invitations/accept -> guest entra na família do owner', async () => {
    const r = await request(app.getHttpServer())
      .post('/api/invitations/accept')
      .set(bearer(tokenGuest))
      .send({ code: inviteCode })
      .expect(201);

    expect(r.body.familyId).toBe(familyId);

    // guest agora deve ver duas famílias (a dele + a do owner)
    const mine = await request(app.getHttpServer())
      .get('/api/families/mine')
      .set(bearer(tokenGuest))
      .expect(200);

    expect(Array.isArray(mine.body)).toBe(true);
    expect(mine.body.length).toBeGreaterThanOrEqual(2);
  });
});
