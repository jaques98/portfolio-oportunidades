import { useState } from 'react';
import type { OpportunityFilters } from '../types';

interface Props { onSearch: (filters: OpportunityFilters) => void }
export function Filters({ onSearch }: Props) {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<OpportunityFilters['status']>('');
  return <form className="filters" aria-label="Filtros de oportunidades" onSubmit={(event) => {
    event.preventDefault(); onSearch({ q: q.trim(), status });
  }}>
    <div className="search-field"><label htmlFor="search">Empresa ou descrição</label>
      <input id="search" type="search" value={q} maxLength={100}
        placeholder="Buscar nas oportunidades" onChange={(event) => setQ(event.target.value)} /></div>
    <div><label htmlFor="status">Situação</label>
      <select id="status" value={status}
        onChange={(event) => setStatus(event.target.value as OpportunityFilters['status'])}>
        <option value="">Todas as situações</option><option value="aberta">Aberta</option>
        <option value="ganha">Ganha</option><option value="perdida">Perdida</option>
      </select></div>
    <div className="filter-actions"><button type="submit">Buscar</button>
      <button type="button" className="secondary" onClick={() => {
        setQ(''); setStatus(''); onSearch({ q: '', status: '' });
      }}>Limpar filtros</button></div>
  </form>;
}
