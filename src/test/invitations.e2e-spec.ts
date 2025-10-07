import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../app.module';

describe('Invitations (e2e)', () => {
  let app: INestApplication;
  let tokenOwner = '';
  let tokenGuest = '';
  let inviteCode = '';
  let familyId = '';

  beforeAll(async () => {
    const mod = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = mod.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

    await app.init();

    // signup owner
    await request(app.getHttpServer())
      .post('/api/auth/signup')
      .send({
        email: `owner_${Date.now()}@mail.com`,
        firstname: 'Owner',
        lastname: 'Fam',
        password: 'P@ssw0rd',
      })
      .expect(201)
      .then((r) => (tokenOwner = r.body.access_token));

    // pega family do owner
    await request(app.getHttpServer())
      .get('/api/families/mine')
      .set('Authorization', `Bearer ${tokenOwner}`)
      .expect(200)
      .then((r) => (familyId = r.body[0].id));

    // signup guest
    const guestEmail = `guest_${Date.now()}@mail.com`;
    await request(app.getHttpServer())
      .post('/api/auth/signup')
      .send({
        email: guestEmail,
        firstname: 'Guest',
        lastname: 'Solo',
        password: 'P@ssw0rd',
      })
      .expect(201)
      .then((r) => (tokenGuest = r.body.access_token));

    // owner cria convite para guest
    await request(app.getHttpServer())
      .post('/api/invitations')
      .set('Authorization', `Bearer ${tokenOwner}`)
      .send({ email: guestEmail }) // default role MEMBER
      .expect(201)
      .then((r) => (inviteCode = r.body.code));
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/invitations -> lista convites da família', async () => {
    await request(app.getHttpServer())
      .get('/api/invitations')
      .set('Authorization', `Bearer ${tokenOwner}`)
      .expect(200)
      .then((r) => {
        expect(Array.isArray(r.body)).toBe(true);
        expect(r.body[0].familyId).toBe(familyId);
      });
  });

  it('POST /api/invitations/accept -> guest entra na família do owner', async () => {
    await request(app.getHttpServer())
      .post('/api/invitations/accept')
      .set('Authorization', `Bearer ${tokenGuest}`)
      .send({ code: inviteCode })
      .expect(201)
      .then((r) => {
        expect(r.body.familyId).toBe(familyId);
      });

    // guest agora deve ver duas famílias (a dele + a do owner)
    await request(app.getHttpServer())
      .get('/api/families/mine')
      .set('Authorization', `Bearer ${tokenGuest}`)
      .expect(200)
      .then((r) => {
        expect(Array.isArray(r.body)).toBe(true);
        expect(r.body.length).toBeGreaterThanOrEqual(2);
      });
  });
});
