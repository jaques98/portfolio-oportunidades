import { defaultDatabasePath, openDatabase } from './db.js';
import { seedOpportunities } from './seed-data.js';

const db = openDatabase();
try {
  const inserted = seedOpportunities(db);
  console.log(`Banco local: ${defaultDatabasePath}`);
  console.log(inserted > 0
    ? `${inserted} oportunidades fictícias inseridas.`
    : 'A base já contém registros. Nenhum dado foi inserido, alterado ou apagado.');
  const summary = db.prepare(`
    SELECT COUNT(*) AS count,
      COALESCE(SUM(amount_cents), 0) AS amountCents,
      COALESCE(SUM(CASE WHEN status = 'aberta' THEN 1 ELSE 0 END), 0) AS openCount,
      COALESCE(SUM(CASE WHEN status = 'aberta' THEN amount_cents ELSE 0 END), 0)
        AS openAmountCents
    FROM opportunities
  `).get();
  console.log('Resumo em centavos:', summary);
} finally {
  db.close();
}
