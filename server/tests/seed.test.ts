import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { openDatabase } from '../src/db.js';
import { seedOpportunities } from '../src/seed-data.js';

describe('Banco SQLite e carga fictícia', () => {
  it('insere três exemplos com totais e situação aberta corretos', () => {
    const db = openDatabase(':memory:');
    try {
      expect(seedOpportunities(db)).toBe(3);
      const row = db.prepare(`
        SELECT COUNT(*) AS count, SUM(amount_cents) AS total,
          SUM(CASE WHEN status = 'aberta' THEN 1 ELSE 0 END) AS openCount,
          SUM(CASE WHEN status = 'aberta' THEN amount_cents ELSE 0 END) AS openTotal
        FROM opportunities
      `).get();
      expect({ ...row }).toEqual({count: 3, total: 400000, openCount: 1, openTotal: 100000});
    } finally { db.close(); }
  });

  it('não duplica nem modifica dados quando a carga é repetida', () => {
    const db = openDatabase(':memory:');
    try {
      seedOpportunities(db);
      db.prepare('UPDATE opportunities SET description = ? WHERE id = 1')
        .run('Descrição alterada pelo usuário');
      const before = db.prepare('SELECT * FROM opportunities ORDER BY id').all();
      expect(seedOpportunities(db)).toBe(0);
      expect(db.prepare('SELECT * FROM opportunities ORDER BY id').all()).toEqual(before);
    } finally { db.close(); }
  });

  it('preserva os registros ao fechar e reabrir um arquivo temporário', () => {
    const directory = mkdtempSync(join(tmpdir(), 'portfolio-sqlite-'));
    const path = join(directory, 'portfolio.db');
    try {
      const first = openDatabase(path);
      let before;
      try {
        seedOpportunities(first);
        before = first.prepare('SELECT * FROM opportunities ORDER BY id').all();
      } finally { first.close(); }
      const second = openDatabase(path);
      try {
        expect(second.prepare('SELECT * FROM opportunities ORDER BY id').all()).toEqual(before);
        expect(seedOpportunities(second)).toBe(0);
      } finally { second.close(); }
    } finally {
      // Apenas a pasta temporária criada por este teste é removida.
      rmSync(directory, { recursive: true, force: true });
    }
  });
});
