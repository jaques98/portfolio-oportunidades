import { useEffect, useRef, useState } from 'react';
import { ApiError, errorMessage } from '../api';
import type { Opportunity, OpportunityInput, OpportunityStatus } from '../types';

interface Props {
  initial: Opportunity | null;
  busy: boolean;
  onSave: (input: OpportunityInput) => Promise<void>;
  onCancel: () => void;
}
export function OpportunityForm({ initial, busy, onSave, onCancel }: Props) {
  const [company, setCompany] = useState(initial?.company ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [amount, setAmount] = useState(initial ? (initial.amountCents / 100).toFixed(2) : '');
  const [status, setStatus] = useState<OpportunityStatus>(initial?.status ?? 'aberta');
  const [fields, setFields] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const firstInput = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const submitting = useRef(false);
  useEffect(() => { firstInput.current?.focus(); }, []);
  function focusInvalid(errors: Record<string, string>) {
    const first = Object.keys(errors)[0];
    if (first) formRef.current?.querySelector<HTMLElement>('[name="' + first + '"]')?.focus();
  }
  async function submit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current || busy) return;
    const next: Record<string, string> = {};
    const cleanCompany = company.trim();
    const cleanDescription = description.trim();
    if (cleanCompany.length < 2 || cleanCompany.length > 100) next.company = 'Use de 2 a 100 caracteres.';
    if (cleanDescription.length < 3 || cleanDescription.length > 300) next.description = 'Use de 3 a 300 caracteres.';
    const value = Number(amount);
    if (!/^\d+(\.\d{1,2})?$/.test(amount) || !Number.isFinite(value)
      || value < 0 || value > 10000000) {
      next.amountCents = 'Informe um valor de 0 a 10.000.000,00, com até duas casas decimais.';
    }
    setFields(next); setError('');
    if (Object.keys(next).length) { focusInvalid(next); return; }
    submitting.current = true;
    try {
      await onSave({ company: cleanCompany, description: cleanDescription,
        amountCents: Math.round(value * 100), status });
    } catch (failure: unknown) {
      const serverFields = failure instanceof ApiError ? failure.fields : {};
      setFields(serverFields); setError(errorMessage(failure)); focusInvalid(serverFields);
    } finally { submitting.current = false; }
  }
  const title = initial ? 'Editar oportunidade' : 'Nova oportunidade';
  return <section className="workspace entry" aria-labelledby="entry-title">
    <div className="section-header"><div><h2 id="entry-title">{title}</h2>
      <p>{initial ? 'Atualize os dados desta negociação.' : 'Preencha os dados do novo registro fictício.'}</p>
    </div><span className="section-label">{initial ? 'EDIÇÃO' : 'CADASTRO'}</span></div>
    <form ref={formRef} className="entry-form" onSubmit={submit} noValidate aria-busy={busy}>
      {error && <div className="form-error" role="alert">{error}</div>}
      <fieldset disabled={busy}>
        <div className="entry-grid">
          <div className="full"><label htmlFor="entry-company">Empresa</label>
            <input ref={firstInput} id="entry-company" name="company" value={company}
              maxLength={100} required onChange={(e) => setCompany(e.target.value)}
              aria-invalid={!!fields.company} aria-describedby={fields.company ? 'company-error' : undefined} />
            {fields.company && <p id="company-error" className="field-error">{fields.company}</p>}</div>
          <div className="full"><label htmlFor="entry-description">Descrição</label>
            <textarea id="entry-description" name="description" value={description} rows={3}
              maxLength={300} required onChange={(e) => setDescription(e.target.value)}
              aria-invalid={!!fields.description} aria-describedby={fields.description ? 'description-error' : undefined} />
            {fields.description && <p id="description-error" className="field-error">{fields.description}</p>}</div>
          <div><label htmlFor="entry-amount">Valor em reais</label>
            <input id="entry-amount" name="amountCents" type="number" min="0" max="10000000"
              step="0.01" inputMode="decimal" value={amount} required onChange={(e) => setAmount(e.target.value)}
              aria-invalid={!!fields.amountCents} aria-describedby={fields.amountCents ? 'amount-error' : 'amount-help'} />
            {fields.amountCents ? <p id="amount-error" className="field-error">{fields.amountCents}</p>
              : <p id="amount-help" className="field-help">Exemplo: 1234,50 para R$ 1.234,50.</p>}</div>
          <div><label htmlFor="entry-status">Situação da oportunidade</label>
            <select id="entry-status" name="status" value={status}
              onChange={(e) => setStatus(e.target.value as OpportunityStatus)}
              aria-invalid={!!fields.status} aria-describedby={fields.status ? 'status-error' : undefined}>
              <option value="aberta">Aberta</option><option value="ganha">Ganha</option><option value="perdida">Perdida</option>
            </select>{fields.status && <p id="status-error" className="field-error">{fields.status}</p>}</div>
        </div>
        <div className="entry-actions"><button type="submit">{busy ? 'Salvando…' : 'Salvar oportunidade'}</button>
          <button type="button" className="secondary" onClick={onCancel}>Cancelar</button></div>
      </fieldset>
    </form>
  </section>;
}
