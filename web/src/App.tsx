import { useEffect, useRef, useState } from 'react';
import { createOpportunity, updateOpportunity, deleteOpportunity, errorMessage, listOpportunities } from './api';
import type { Opportunity, OpportunityInput, OpportunityFilters, OpportunityList as ListData } from './types';
import { statusLabels } from './format';
import { Filters } from './components/Filters';
import { Summary } from './components/Summary';
import { OpportunityList } from './components/OpportunityList';
import { OpportunityForm } from './components/OpportunityForm';
import './App.css';

type LoadState = { kind: 'loading' } | { kind: 'ready'; data: ListData } | { kind: 'error'; message: string };
function App() {
  const [filters, setFilters] = useState<OpportunityFilters>({ q: '', status: '' });
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState<LoadState>({ kind: 'loading' });
  const [form, setForm] = useState<{ initial: Opportunity | null } | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [mutationError, setMutationError] = useState('');
  const mutationLock = useRef(false);
  const newButton = useRef<HTMLButtonElement>(null);
  function reload() { setState({ kind: 'loading' }); setRevision((v) => v + 1); }
  function closeForm() { setForm(null); newButton.current?.focus(); }
  function openForm(initial: Opportunity | null) {
    setMutationError(''); setNotice(''); setForm({ initial });
  }
  async function save(input: OpportunityInput) {
    if (mutationLock.current) throw new Error('Uma operação está em andamento.');
    mutationLock.current = true; setBusy(true); setMutationError('');
    try {
      if (form?.initial) await updateOpportunity(form.initial.id, input);
      else await createOpportunity(input);
      closeForm();
      setNotice('Oportunidade salva. Os filtros da consulta foram mantidos.');
      reload();
    } finally { mutationLock.current = false; setBusy(false); }
  }
  async function remove(item: Opportunity) {
    if (mutationLock.current || !window.confirm('Excluir a oportunidade de ' + item.company + '? Esta ação não pode ser desfeita.')) return;
    mutationLock.current = true; setBusy(true); setMutationError(''); setNotice('');
    try {
      await deleteOpportunity(item.id);
      if (form?.initial?.id === item.id) closeForm();
      setNotice('Oportunidade excluída. Os filtros da consulta foram mantidos.');
      reload();
    } catch (error: unknown) { setMutationError(errorMessage(error)); }
    finally { mutationLock.current = false; setBusy(false); }
  }
  useEffect(() => {
    const controller = new AbortController();
    listOpportunities(filters, controller.signal).then((data) => {
      if (!controller.signal.aborted) setState({ kind: 'ready', data });
    }).catch((error: unknown) => {
      if (!controller.signal.aborted) setState({ kind: 'error', message:
        error instanceof TypeError ? 'Não foi possível acessar a API. Confira se o servidor está ligado.'
          : error instanceof Error ? error.message : 'Não foi possível carregar os dados.' });
    });
    return () => controller.abort();
  }, [filters, revision]);

  return <>
    <header className="masthead"><div className="header-inner">
      <a className="brand" href="./" aria-label="Início do portfólio de oportunidades">
        <span className="brand-mark" aria-hidden="true">MJ</span><span>PORTFÓLIO <span className="brand-light">/ Maviael Jaques</span></span>
      </a><span className="demo-tag"><span aria-hidden="true">●</span> Dados fictícios</span>
    </div></header>
    <main className="page">
      <div className="intro"><div className="intro-heading"><div><p className="eyebrow">GESTÃO COMERCIAL · DEMONSTRADOR</p>
        <h1>Oportunidades comerciais</h1>
        <p className="subtitle">Uma visão simples para acompanhar negociações e seus valores estimados.</p></div>
        <button type="button" ref={newButton} disabled={busy} onClick={() => openForm(null)}>+ Nova oportunidade</button>
      </div></div>
      {notice && <p role="status" className="success-notice">{notice}</p>}
      {mutationError && <div role="alert" className="error"><p>{mutationError}</p></div>}
      {form && <OpportunityForm key={form.initial?.id ?? 'new'} initial={form.initial}
        busy={busy} onSave={save} onCancel={closeForm} />}
      <section className="workspace" aria-labelledby="consult-title">
        <div className="section-header"><div><h2 id="consult-title">Consultar oportunidades</h2>
          <p>Pesquise por empresa ou descrição e refine pela situação.</p></div>
          <span className="section-label">CONSULTA</span></div>
        <Filters onSearch={(nextFilters) => { setState({ kind: 'loading' }); setFilters(nextFilters); }} />
        <div className="applied">Consulta atual: <strong>{filters.q ? '“' + filters.q + '”' : 'Todas as empresas'}</strong>
          <span aria-hidden="true"> / </span>{filters.status ? statusLabels[filters.status] : 'Todas as situações'}</div>
      </section>
      <div aria-live="polite" aria-busy={state.kind === 'loading'}>
        {state.kind === 'loading' && <div className="loading" role="status">Carregando oportunidades…</div>}
        {state.kind === 'error' && <div className="error" role="alert"><h2>Não foi possível carregar a consulta</h2>
          <p>{state.message}</p><button type="button" onClick={() => { setState({ kind: 'loading' }); setRevision((v) => v + 1); }}>Tentar novamente</button></div>}
        {state.kind === 'ready' && <>
          <Summary summary={state.data.summary} />
          <section className="workspace results" aria-labelledby="results-title">
            <div className="section-header"><div><h2 id="results-title">Resultado da consulta</h2>
              <p>{state.data.summary.count} {state.data.summary.count === 1 ? 'oportunidade encontrada' : 'oportunidades encontradas'}</p></div>
              <span className="result-note">Valores estimados em reais</span></div>
            <OpportunityList items={state.data.items} busy={busy} onEdit={openForm} onDelete={remove} />
          </section>
        </>}
      </div>
      <footer className="page-footer"><span>Maviael Jaques · Desenvolvimento Full Stack</span>
        <span>Demonstrador independente · Dados de exemplo</span></footer>
    </main>
  </>;
}
export default App;
