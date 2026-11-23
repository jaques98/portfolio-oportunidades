import type { DatabaseSync } from 'node:sqlite';
import type { OpportunityStatus } from './types.js';

const examples: ReadonlyArray<{
  company: string;
  description: string;
  amountCents: number;
  status: OpportunityStatus;
}> = [
  {
    company: 'Clínica Horizonte Demo',
    description: 'Oportunidade fictícia para demonstração de acompanhamento.',
    amountCents: 100000,
    status: 'aberta',
  },
  {
    company: 'Clínica Aurora Demo',
    description: 'Negociação fictícia concluída, sem venda ou envio real.',
    amountCents: 250000,
    status: 'ganha',
  },
  {
    company: 'Laboratório Mar Azul Demo',
    description: 'Exemplo fictício de oportunidade encerrada como perdida.',
    amountCents: 50000,
    status: 'perdida',
  },
];

export function seedOpportunities(db: DatabaseSync): number {
  // Conferência e inserções na mesma transação evitam duplicação concorrente.
  db.exec('BEGIN IMMEDIATE');
  try {
    const row = db.prepare('SELECT COUNT(*) AS count FROM opportunities').get();
    if (Number(row?.count) > 0) {
      db.exec('COMMIT');
      return 0;
    }
    const insert = db.prepare(`
      INSERT INTO opportunities
        (company, description, amount_cents, status, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    const createdAt = new Date().toISOString();
    for (const example of examples) {
      insert.run(example.company, example.description, example.amountCents,
        example.status, createdAt);
    }
    db.exec('COMMIT');
    return examples.length;
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}
