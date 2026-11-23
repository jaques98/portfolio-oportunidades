import type { DatabaseSync, SQLInputValue, SQLOutputValue } from 'node:sqlite';
import type { Opportunity } from './types.js';
import type { Filters, OpportunityInput } from './validation.js';

type Row = Record<string, SQLOutputValue>;
function mapRow(row: Row): Opportunity {
  return { id: Number(row.id), company: String(row.company),
    description: String(row.description), amountCents: Number(row.amount_cents),
    status: row.status as Opportunity['status'], createdAt: String(row.created_at) };
}

export function createRepository(db: DatabaseSync) {
  // JavaScript trata maiúsculas/minúsculas Unicode, inclusive letras acentuadas.
  db.function('search_normalize', { deterministic: true },
    (value) => String(value ?? '').toLocaleLowerCase('pt-BR'));
  const get = (id: number) => {
    const row = db.prepare('SELECT * FROM opportunities WHERE id = ?').get(id);
    return row ? mapRow(row) : undefined;
  };
  return {
    list(filters: Filters) {
      const clauses: string[] = [];
      const params: SQLInputValue[] = [];
      if (filters.q) {
        // instr faz busca literal: % e _ não se tornam curingas SQL.
        clauses.push('(instr(search_normalize(company), ?) > 0 OR instr(search_normalize(description), ?) > 0)');
        const q = filters.q.toLocaleLowerCase('pt-BR');
        params.push(q, q);
      }
      if (filters.status) { clauses.push('status = ?'); params.push(filters.status); }
      const where = clauses.length ? ' WHERE ' + clauses.join(' AND ') : '';
      const items = db.prepare('SELECT * FROM opportunities' + where + ' ORDER BY id DESC')
        .all(...params).map(mapRow);
      const summary = db.prepare(
        'SELECT COUNT(*) AS count, COALESCE(SUM(amount_cents), 0) AS amountCents, ' +
        "COALESCE(SUM(CASE WHEN status = 'aberta' THEN 1 ELSE 0 END), 0) AS openCount, " +
        "COALESCE(SUM(CASE WHEN status = 'aberta' THEN amount_cents ELSE 0 END), 0) AS openAmountCents " +
        'FROM opportunities' + where
      ).get(...params)!;
      return { items, summary: { count: Number(summary.count),
        amountCents: Number(summary.amountCents), openCount: Number(summary.openCount),
        openAmountCents: Number(summary.openAmountCents) } };
    },
    create(input: OpportunityInput) {
      const result = db.prepare(
        'INSERT INTO opportunities (company, description, amount_cents, status, created_at) VALUES (?, ?, ?, ?, ?)'
      ).run(input.company, input.description, input.amountCents, input.status, new Date().toISOString());
      return get(Number(result.lastInsertRowid))!;
    },
    update(id: number, input: OpportunityInput) {
      const result = db.prepare(
        'UPDATE opportunities SET company = ?, description = ?, amount_cents = ?, status = ? WHERE id = ?'
      ).run(input.company, input.description, input.amountCents, input.status, id);
      return Number(result.changes) ? get(id) : undefined;
    },
    remove(id: number) {
      return Number(db.prepare('DELETE FROM opportunities WHERE id = ?').run(id).changes) > 0;
    },
  };
}
