import type { Opportunity } from '../types';
import { formatMoney, statusLabels } from '../format';

interface Props {
  items: Opportunity[];
  busy: boolean;
  onEdit: (item: Opportunity) => void;
  onDelete: (item: Opportunity) => void;
}
export function OpportunityList({ items, busy, onEdit, onDelete }: Props) {
  if (!items.length) return <div className="empty">
    <span className="empty-symbol" aria-hidden="true">◇</span>
    <h3>Nenhuma oportunidade encontrada</h3>
    <p>Experimente outro termo ou limpe os filtros da consulta.</p>
  </div>;
  return <div className="table-wrap"><table>
    <caption className="sr-only">Oportunidades encontradas na consulta</caption>
    <thead><tr><th scope="col">Empresa</th><th scope="col">Descrição</th>
      <th scope="col" className="money">Valor estimado</th><th scope="col">Situação</th><th scope="col">Ações</th></tr></thead>
    <tbody>{items.map((item) => <tr key={item.id}>
      <td data-label="Empresa" className="company">{item.company}</td>
      <td data-label="Descrição" className="description">{item.description}</td>
      <td data-label="Valor estimado" className="money">{formatMoney(item.amountCents)}</td>
      <td data-label="Situação"><span className={'badge badge-' + item.status}>{statusLabels[item.status]}</span></td>
      <td data-label="Ações"><div className="row-actions">
        <button className="secondary" type="button" disabled={busy} aria-label={'Editar ' + item.company}
          onClick={() => onEdit(item)}>Editar</button>
        <button className="danger-button" type="button" disabled={busy} aria-label={'Excluir ' + item.company}
          onClick={() => onDelete(item)}>Excluir</button>
      </div></td>
    </tr>)}</tbody>
  </table></div>;
}
