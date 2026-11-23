import { createApp } from './app.js';
import { openDatabase } from './db.js';

const host = '127.0.0.1';
const port = Number(process.env.PORT ?? '3001');
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT deve ser um número inteiro entre 1 e 65535.');
}
const db = openDatabase();
const app = createApp(db);
let closed = false;
function closeDatabase() {
  if (!closed) { db.close(); closed = true; }
}
const server = app.listen(port, host, () => {
  console.log('API local: http://' + host + ':' + port + '/api/health');
});
server.on('error', (error: NodeJS.ErrnoException) => {
  console.error(error.code === 'EADDRINUSE'
    ? 'A porta ' + port + ' já está em uso. Confira seus terminais.'
    : 'Não foi possível iniciar a API: ' + error.message);
  closeDatabase();
  process.exitCode = 1;
});
for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, () => { server.close(closeDatabase); });
}
