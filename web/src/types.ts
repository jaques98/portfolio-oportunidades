export type OpportunityStatus = 'aberta' | 'ganha' | 'perdida';
export interface Opportunity {
  id: number;
  company: string;
  description: string;
  amountCents: number;
  status: OpportunityStatus;
  createdAt: string;
}
export interface OpportunitySummary {
  count: number;
  amountCents: number;
  openCount: number;
  openAmountCents: number;
}
export interface OpportunityList {
  items: Opportunity[];
  summary: OpportunitySummary;
}
export interface OpportunityFilters {
  q: string;
  status: '' | OpportunityStatus;
}

export type OpportunityInput = Pick<Opportunity, 'company' | 'description' | 'amountCents' | 'status'>;
