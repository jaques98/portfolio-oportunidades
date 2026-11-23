export type OpportunityStatus = 'aberta' | 'ganha' | 'perdida';

// Dinheiro é armazenado em centavos: R$ 1.000,00 = 100000.
export interface Opportunity {
  id: number;
  company: string;
  description: string;
  amountCents: number;
  status: OpportunityStatus;
  createdAt: string;
}
