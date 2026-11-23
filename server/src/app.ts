import express from 'express';
import type { ErrorRequestHandler } from 'express';
import type { DatabaseSync } from 'node:sqlite';
import { opportunityRoutes } from './routes.js';
import { HttpError } from './validation.js';

// A conexão é fornecida por quem inicia o app: arquivo local ou banco de teste.
export function createApp(db: DatabaseSync) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '50kb' }));
  app.get('/api/health', (_request, response) => {
    response.status(200).json({ ok: true });
  });
  app.use('/api/opportunities', opportunityRoutes(db));
  app.use((_request, response) => {
    response.status(404).json({ message: 'Rota não encontrada.' });
  });
  const handleError: ErrorRequestHandler = (error: unknown, _request, response, _next) => {
    if (error instanceof HttpError) {
      response.status(error.status).json({ message: error.message,
        ...(error.errors ? { errors: error.errors } : {}) });
      return;
    }
    if (typeof error === 'object' && error !== null && 'type' in error) {
      if (error.type === 'entity.parse.failed') {
        response.status(400).json({ message: 'JSON malformado.' });
        return;
      }
      if (error.type === 'entity.too.large') {
        response.status(413).json({ message: 'O conteúdo excede o limite de 50 KB.' });
        return;
      }
    }
    console.error('Erro interno da API:', error);
    response.status(500).json({ message: 'Não foi possível concluir a operação.' });
  };
  app.use(handleError);
  return app;
}
