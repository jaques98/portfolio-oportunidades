import type { OpportunitySummary } from '../types';
import { formatMoney } from '../format';

export function Summary({ summary }: { summary: OpportunitySummary }) {
  const cards = [
    { label: 'Oportunidades', value: String(summary.count), note: 'No resultado da consulta' },
    { label: 'Valor total', value: formatMoney(summary.amountCents), note: 'Todas as situações do resultado' },
    { label: 'Em aberto', value: String(summary.openCount), note: 'Negociações em acompanhamento' },
    { label: 'Valor em aberto', value: formatMoney(summary.openAmountCents), note: 'Estimativa das negociações abertas' },
  ];
  return <section className="summary" aria-label="Resumo da consulta">
    {cards.map((card) => <article className="summary-card" key={card.label}>
      <h2>{card.label}</h2><p className="metric">{card.value}</p><p className="metric-note">{card.note}</p>
    </article>)}
  </section>;
}
