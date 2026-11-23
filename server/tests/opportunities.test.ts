import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import type { DatabaseSync } from 'node:sqlite';
import { createApp } from '../src/app.js';
import { openDatabase } from '../src/db.js';
import { seedOpportunities } from '../src/seed-data.js';

let db: DatabaseSync;
let app: ReturnType<typeof createApp>;
const valid = { company: 'Clínica Teste Demo', description: 'Exemplo fictício',
  amountCents: 123450, status: 'aberta' };

beforeEach(() => { db = openDatabase(':memory:'); app = createApp(db); });
afterEach(() => db.close());

describe('API de oportunidades', () => {
  it('mantém a rota de saúde', async () => {
    const r = await request(app).get('/api/health');
    expect(r.status).toBe(200); expect(r.body).toEqual({ ok: true });
  });
  it('retorna resumo zerado em base vazia', async () => {
    const r = await request(app).get('/api/opportunities');
    expect(r.status).toBe(200);
    expect(r.body).toEqual({ items: [], summary:
      { count: 0, amountCents: 0, openCount: 0, openAmountCents: 0 } });
  });
  it('cadastra, remove espaços e devolve id e data', async () => {
    const r = await request(app).post('/api/opportunities').send({ ...valid, company: '  Clínica Teste Demo  ' });
    expect(r.status).toBe(201);
    expect(r.body).toMatchObject({ ...valid, id: 1 });
    expect(Number.isNaN(Date.parse(r.body.createdAt))).toBe(false);
    expect(r.headers.location).toBe('/api/opportunities/1');
  });
  it.each([
    { company: '' }, { company: 'a' }, { company: 'a'.repeat(101) },
    { description: 'ab' }, { description: 'a'.repeat(301) },
    { amountCents: -1 }, { amountCents: 1.5 }, { amountCents: '100' },
    { amountCents: 1000000001 }, { amountCents: null }, { status: 'invalida' },
  ])('rejeita dados inválidos sem gravar: %j', async (change) => {
    const r = await request(app).post('/api/opportunities').send({ ...valid, ...change });
    expect(r.status).toBe(400);
    expect(r.body.errors).toBeDefined();
    expect((await request(app).get('/api/opportunities')).body.summary.count).toBe(0);
  });
  it.each([null, [], {}, 'texto'])('rejeita corpo incompleto: %j', async (body) => {
    const r = await request(app).post('/api/opportunities')
      .set('Content-Type', 'application/json').send(JSON.stringify(body));
    expect(r.status).toBe(400);
  });
  it('aceita zero centavos', async () => {
    const r = await request(app).post('/api/opportunities').send({ ...valid, amountCents: 0 });
    expect(r.status).toBe(201); expect(r.body.amountCents).toBe(0);
  });
  it('lista em ordem decrescente com os totais do seed', async () => {
    seedOpportunities(db);
    const r = await request(app).get('/api/opportunities');
    expect(r.body.items.map((i: {id: number}) => i.id)).toEqual([3, 2, 1]);
    expect(r.body.summary).toEqual({ count: 3, amountCents: 400000, openCount: 1, openAmountCents: 100000 });
  });
  it('combina pesquisa acentuada sem distinguir caixa e situação', async () => {
    seedOpportunities(db);
    const r = await request(app).get('/api/opportunities').query({ q: ' CLÍNICA ', status: 'aberta' });
    expect(r.status).toBe(200);
    expect(r.body.items).toHaveLength(1);
    expect(r.body.items[0].company).toBe('Clínica Horizonte Demo');
    expect(r.body.summary).toEqual({ count: 1, amountCents: 100000, openCount: 1, openAmountCents: 100000 });
  });
  it('busca também na descrição e trata curingas como texto literal', async () => {
    await request(app).post('/api/opportunities').send({ ...valid, description: 'Proposta 50%_OFF' });
    const found = await request(app).get('/api/opportunities').query({ q: '%_' });
    expect(found.body.items).toHaveLength(1);
    const none = await request(app).get('/api/opportunities').query({ q: 'inexistente' });
    expect(none.body).toEqual({ items: [], summary: { count: 0, amountCents: 0, openCount: 0, openAmountCents: 0 } });
  });
  it('não interpreta injeção SQL como consulta', async () => {
    seedOpportunities(db);
    const r = await request(app).get('/api/opportunities').query({ q: "' OR 1=1 --" });
    expect(r.status).toBe(200); expect(r.body.items).toEqual([]);
  });
  it.each(['?status=', '?status=inv', '?q=' + 'a'.repeat(101),
    '?q=um&q=dois', '?status=aberta&status=ganha'])('rejeita filtro inválido %s', async (query) => {
    expect((await request(app).get('/api/opportunities' + query)).status).toBe(400);
  });
  it('edita preservando id e createdAt, e atualiza os totais', async () => {
    const created = await request(app).post('/api/opportunities').send(valid);
    const r = await request(app).put('/api/opportunities/' + created.body.id)
      .send({ ...valid, amountCents: 150000, status: 'ganha' });
    expect(r.status).toBe(200);
    expect(r.body).toMatchObject({ id: created.body.id, createdAt: created.body.createdAt,
      amountCents: 150000, status: 'ganha' });
    expect((await request(app).get('/api/opportunities')).body.summary)
      .toEqual({ count: 1, amountCents: 150000, openCount: 0, openAmountCents: 0 });
  });
  it('PUT inválido não altera o registro', async () => {
    const created = await request(app).post('/api/opportunities').send(valid);
    expect((await request(app).put('/api/opportunities/1').send({ company: 'Outra' })).status).toBe(400);
    expect((await request(app).get('/api/opportunities')).body.items[0]).toEqual(created.body);
  });
  it('exclui apenas o registro escolhido e devolve 204 sem corpo', async () => {
    seedOpportunities(db);
    const r = await request(app).delete('/api/opportunities/1');
    expect(r.status).toBe(204); expect(r.text).toBe('');
    const list = await request(app).get('/api/opportunities');
    expect(list.body.items.map((i: {id: number}) => i.id)).toEqual([3, 2]);
    expect(list.body.summary).toEqual({ count: 2, amountCents: 300000, openCount: 0, openAmountCents: 0 });
    expect((await request(app).delete('/api/opportunities/1')).status).toBe(404);
  });
  it('PUT e DELETE de id inexistente retornam 404', async () => {
    expect((await request(app).put('/api/opportunities/99').send(valid)).status).toBe(404);
    expect((await request(app).delete('/api/opportunities/99')).status).toBe(404);
  });
  it.each(['0', '-1', '1.5', 'abc', '999999999999999999'])('rejeita identificador %s', async (id) => {
    expect((await request(app).delete('/api/opportunities/' + id)).status).toBe(400);
  });
  it('responde JSON compreensível a conteúdo malformado', async () => {
    const r = await request(app).post('/api/opportunities')
      .set('Content-Type', 'application/json').send('{');
    expect(r.status).toBe(400); expect(r.body.message).toBe('JSON malformado.');
  });
  it('limita o tamanho do corpo', async () => {
    const r = await request(app).post('/api/opportunities').send({ ...valid, description: 'a'.repeat(60000) });
    expect(r.status).toBe(413);
  });
  it('rota inexistente devolve JSON e 404', async () => {
    const r = await request(app).get('/api/inexistente');
    expect(r.status).toBe(404); expect(r.body.message).toBe('Rota não encontrada.');
  });
});
