// src/test/grocery.lists.crud.e2e-spec.ts
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createApp, signup, myFamilyId } from './test-utils';

describe('Grocery Lists (CRUD) e2e', () => {
  let app: INestApplication;
  let token = '';
  let familyId = '';
  let listId = '';
  let itemId = '';
  const weekStart = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  beforeAll(async () => {
    app = await createApp();
    ({ token } = await signup(app));
    familyId = await myFamilyId(app, token); // só para uso em asserts se quiser
  });

  afterAll(async () => await app.close());

  it('POST /api/grocery/lists -> 201 (com itens)', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/grocery/lists')
      .set('Authorization', `Bearer ${token}`)
      .send({
        // NÃO envie familyId aqui (ValidationPipe forbids!)
        weekStart,               // ok
        title: 'Compras mês',
        category: 'OUTROS',      // enum válido
        items: [
          { name: 'Leite', unidade: 'un', quantidade: 2, brand: 'X' },
          { name: 'Pão', unidade: 'un', quantidade: 10 },
        ],
      })
      .expect(201);

    listId = res.body.id;
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.items.length).toBe(2);
  });

  it('GET /api/grocery/lists -> 200 (ordenado por updatedAt)', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/grocery/lists')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    // opcional: conferir que há uma lista dessa família
    expect(res.body.some((l: any) => l.familyId === familyId)).toBe(true);
  });

  it('GET /api/grocery/lists/:id -> 200', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/grocery/lists/${listId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(res.body?.id).toBe(listId);
  });

  it('PATCH /api/grocery/lists/:id -> 200 (archive)', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/grocery/lists/${listId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ archived: true })
      .expect(200);
    expect(res.body.archived).toBe(true);
  });

  it('POST /api/grocery/lists/:id/items -> 201 (novo item)', async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/grocery/lists/${listId}/items`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Manteiga', unidade: 'un', quantidade: 1 })
      .expect(201);
    itemId = res.body.id;
  });

  it('PATCH /api/grocery/lists/:id/items/:itemId -> 200 (checked)', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/grocery/lists/${listId}/items/${itemId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ checked: true })
      .expect(200);
    expect(res.body.checked).toBe(true);
  });

  it('DELETE /api/grocery/lists/:id/items/:itemId -> 200', async () => {
    await request(app.getHttpServer())
      .delete(`/api/grocery/lists/${listId}/items/${itemId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });
});
