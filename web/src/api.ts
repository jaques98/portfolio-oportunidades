import type { Opportunity, OpportunityFilters, OpportunityInput, OpportunityList } from './types';

export class ApiError extends Error {
  status: number;
  fields: Record<string, string>;
  constructor(message: string, status: number, fields: Record<string, string> = {}) {
    super(message); this.status = status; this.fields = fields;
  }
}
async function apiRequest(path: string, options: RequestInit = {}) {
  const response = await fetch('/api/opportunities' + path, options);
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new ApiError(body?.message || 'Não foi possível concluir a operação.',
      response.status, body?.errors ?? {});
  }
  if (response.status === 204) return undefined;
  return response.json();
}
export async function listOpportunities(filters: OpportunityFilters, signal?: AbortSignal): Promise<OpportunityList> {
  const query = new URLSearchParams();
  if (filters.q.trim()) query.set('q', filters.q.trim());
  if (filters.status) query.set('status', filters.status);
  return apiRequest(query.size ? '?' + query.toString() : '', { signal });
}
export async function createOpportunity(input: OpportunityInput): Promise<Opportunity> {
  return apiRequest('', { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input) });
}
export async function updateOpportunity(id: number, input: OpportunityInput): Promise<Opportunity> {
  return apiRequest('/' + id, { method: 'PUT', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input) });
}
export async function deleteOpportunity(id: number): Promise<void> {
  await apiRequest('/' + id, { method: 'DELETE' });
}
export function errorMessage(error: unknown): string {
  if (error instanceof TypeError) return 'Não foi possível acessar a API. Confira se o servidor está ligado.';
  return error instanceof Error ? error.message : 'Não foi possível concluir a operação.';
}
