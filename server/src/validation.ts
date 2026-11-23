import type { Opportunity, OpportunityStatus } from './types.js';

export type OpportunityInput = Pick<Opportunity, 'company' | 'description' | 'amountCents' | 'status'>;
export interface Filters { q?: string; status?: OpportunityStatus }
export class HttpError extends Error {
  constructor(public status: number, message: string, public errors?: Record<string, string>) {
    super(message);
  }
}
const statuses = new Set(['aberta', 'ganha', 'perdida']);

export function validateInput(body: unknown): OpportunityInput {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new HttpError(400, 'Informe um objeto JSON com os dados da oportunidade.');
  }
  const values = body as Record<string, unknown>;
  const errors: Record<string, string> = {};
  const company = typeof values.company === 'string' ? values.company.trim() : '';
  const description = typeof values.description === 'string' ? values.description.trim() : '';
  if (company.length < 2 || company.length > 100) errors.company = 'Use de 2 a 100 caracteres.';
  if (description.length < 3 || description.length > 300) errors.description = 'Use de 3 a 300 caracteres.';
  if (typeof values.amountCents !== 'number' || !Number.isInteger(values.amountCents)
      || values.amountCents < 0 || values.amountCents > 1_000_000_000) {
    errors.amountCents = 'Informe um número inteiro entre 0 e 1000000000 centavos.';
  }
  if (typeof values.status !== 'string' || !statuses.has(values.status)) {
    errors.status = 'Escolha aberta, ganha ou perdida.';
  }
  if (Object.keys(errors).length) throw new HttpError(400, 'Dados inválidos.', errors);
  return { company, description, amountCents: values.amountCents as number,
    status: values.status as OpportunityStatus };
}

export function validateId(value: unknown): number {
  if (typeof value !== 'string' || !/^[1-9][0-9]*$/.test(value)
      || !Number.isSafeInteger(Number(value))) {
    throw new HttpError(400, 'Identificador inválido.');
  }
  return Number(value);
}

export function validateFilters(query: Record<string, unknown>): Filters {
  const result: Filters = {};
  if (query.q !== undefined) {
    if (typeof query.q !== 'string' || query.q.trim().length > 100) {
      throw new HttpError(400, 'Pesquisa inválida. Use até 100 caracteres.');
    }
    const q = query.q.trim();
    if (q) result.q = q;
  }
  if (query.status !== undefined) {
    if (typeof query.status !== 'string' || !statuses.has(query.status)) {
      throw new HttpError(400, 'Filtro de situação inválido.');
    }
    result.status = query.status as OpportunityStatus;
  }
  return result;
}
