import { Router } from 'express';
import type { DatabaseSync } from 'node:sqlite';
import { createRepository } from './repository.js';
import { HttpError, validateFilters, validateId, validateInput } from './validation.js';

export function opportunityRoutes(db: DatabaseSync) {
  const router = Router();
  const repository = createRepository(db);
  router.get('/', (request, response) => {
    response.json(repository.list(validateFilters(request.query)));
  });
  router.post('/', (request, response) => {
    const created = repository.create(validateInput(request.body));
    response.status(201).location('/api/opportunities/' + created.id).json(created);
  });
  router.put('/:id', (request, response) => {
    const id = validateId(request.params.id);
    const updated = repository.update(id, validateInput(request.body));
    if (!updated) throw new HttpError(404, 'Oportunidade não encontrada.');
    response.json(updated);
  });
  router.delete('/:id', (request, response) => {
    if (!repository.remove(validateId(request.params.id))) {
      throw new HttpError(404, 'Oportunidade não encontrada.');
    }
    response.status(204).end();
  });
  return router;
}
