const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
export function formatMoney(amountCents: number) { return currency.format(amountCents / 100); }
export const statusLabels = { aberta: 'Aberta', ganha: 'Ganha', perdida: 'Perdida' } as const;
