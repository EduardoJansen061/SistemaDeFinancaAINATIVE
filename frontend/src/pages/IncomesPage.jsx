import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import {
  RiAddLine, RiDeleteBin2Line, RiEditLine, RiCheckLine,
  RiMoneyDollarCircleLine,
} from 'react-icons/ri';
import AOS from 'aos';
import Header from '../components/Header';
import Modal from '../components/Modal';
import { incomesService } from '../services';
import { useMonthNav } from '../hooks/useApi';
import { formatCurrency, incomeTypeLabel } from '../utils/formatters';

const schema = z.object({
  type: z.enum(['salary', 'extra', 'other']),
  description: z.string().min(2, 'Mínimo 2 caracteres'),
  amount: z.coerce.number().positive('Valor deve ser positivo'),
  currency: z.enum(['BRL', 'USD', 'EUR']).default('BRL'),
  exchange_rate: z.coerce.number().positive().optional(),
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2000).max(2100),
  is_recurring: z.boolean().default(false),
  notes: z.string().optional(),
});

const TYPE_BADGES = {
  salary: 'badge-indigo',
  extra: 'badge-green',
  other: 'badge-gray',
};

const IncomesPage = () => {
  const { onMenuClick } = useOutletContext();
  const monthNav = useMonthNav();
  const [incomes, setIncomes] = useState([]);
  const [totalBrl, setTotalBrl] = useState(0);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const now = new Date();
  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      type: 'salary', currency: 'BRL', exchange_rate: 1,
      month: monthNav.month, year: monthNav.year, is_recurring: false,
    },
  });

  const currency = watch('currency');

  useEffect(() => { AOS.init({ duration: 500, once: true }); }, []);
  useEffect(() => { fetchIncomes(); }, [monthNav.month, monthNav.year]);

  const fetchIncomes = async () => {
    setLoading(true);
    try {
      const res = await incomesService.list({ month: monthNav.month, year: monthNav.year });
      setIncomes(res.data.incomes);
      setTotalBrl(res.data.total_brl);
    } catch { toast.error('Erro ao carregar receitas.'); }
    finally { setLoading(false); }
  };

  const openCreate = () => {
    setEditing(null);
    reset({ type: 'salary', currency: 'BRL', exchange_rate: 1, month: monthNav.month, year: monthNav.year, is_recurring: false });
    setModalOpen(true);
  };

  const openEdit = (income) => {
    setEditing(income);
    reset({
      type: income.type, description: income.description,
      amount: parseFloat(income.amount), currency: income.currency,
      exchange_rate: parseFloat(income.exchange_rate),
      month: income.month, year: income.year,
      is_recurring: income.is_recurring, notes: income.notes || '',
    });
    setModalOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      if (editing) {
        await incomesService.update(editing.id, data);
        toast.success('Receita atualizada!');
      } else {
        await incomesService.create(data);
        toast.success('Receita adicionada!');
      }
      setModalOpen(false);
      fetchIncomes();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao salvar.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remover esta receita?')) return;
    try {
      await incomesService.remove(id);
      toast.success('Receita removida.');
      fetchIncomes();
    } catch { toast.error('Erro ao remover.'); }
  };

  const handleReceive = async (id) => {
    try {
      await incomesService.receive(id);
      toast.success('Marcado como recebido!');
      fetchIncomes();
    } catch { toast.error('Erro.'); }
  };

  return (
    <div>
      <Header
        title="Receitas"
        subtitle="Salário, extras e outras entradas"
        monthNav={monthNav}
        onMenuClick={onMenuClick}
      />

      {/* Summary Bar */}
      <div className="glass-card p-4 mb-6 flex items-center justify-between" data-aos="fade-up">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(16,185,129,0.15)' }}>
            <RiMoneyDollarCircleLine style={{ color: '#10b981', fontSize: '1.25rem' }} />
          </div>
          <div>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Total do mês</p>
            <p className="text-xl font-bold amount-positive">{formatCurrency(totalBrl)}</p>
          </div>
        </div>
        <button id="btn-add-income" onClick={openCreate} className="btn btn-primary btn-sm">
          <RiAddLine /> Adicionar
        </button>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden" data-aos="fade-up" data-aos-delay="100">
        {loading ? (
          <div className="flex justify-center p-12">
            <div className="spinner" style={{ width: '32px', height: '32px' }} />
          </div>
        ) : incomes.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16">
            <RiMoneyDollarCircleLine style={{ fontSize: '3rem', color: 'var(--color-text-muted)', marginBottom: '12px' }} />
            <p style={{ color: 'var(--color-text-muted)' }}>Nenhuma receita registrada neste mês.</p>
            <button onClick={openCreate} className="btn btn-primary btn-sm mt-4">
              <RiAddLine /> Adicionar primeira receita
            </button>
          </div>
        ) : (
          <table className="data-table" aria-label="Tabela de receitas">
            <thead>
              <tr>
                <th>Descrição</th>
                <th>Tipo</th>
                <th>Valor</th>
                <th>Em BRL</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {incomes.map((income) => (
                <tr key={income.id}>
                  <td>
                    <div>
                      <p className="font-medium text-white">{income.description}</p>
                      {income.is_recurring && (
                        <span className="badge badge-cyan" style={{ fontSize: '0.65rem', marginTop: '2px' }}>Recorrente</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${TYPE_BADGES[income.type]}`}>
                      {incomeTypeLabel(income.type)}
                    </span>
                  </td>
                  <td className="font-mono">
                    {formatCurrency(income.amount, income.currency)}
                    {income.currency !== 'BRL' && (
                      <span className="badge badge-gray ml-1">{income.currency}</span>
                    )}
                  </td>
                  <td className="font-mono amount-positive font-semibold">
                    {formatCurrency(income.amount_brl)}
                  </td>
                  <td>
                    {income.received ? (
                      <span className="badge badge-green">Recebido</span>
                    ) : (
                      <span className="badge badge-amber">Pendente</span>
                    )}
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      {!income.received && (
                        <button
                          onClick={() => handleReceive(income.id)}
                          className="btn btn-ghost btn-icon btn-sm"
                          title="Marcar como recebido"
                          aria-label="Marcar como recebido"
                        >
                          <RiCheckLine style={{ color: '#10b981' }} />
                        </button>
                      )}
                      <button
                        onClick={() => openEdit(income)}
                        className="btn btn-ghost btn-icon btn-sm"
                        aria-label="Editar"
                      >
                        <RiEditLine />
                      </button>
                      <button
                        onClick={() => handleDelete(income.id)}
                        className="btn btn-ghost btn-icon btn-sm"
                        aria-label="Remover"
                      >
                        <RiDeleteBin2Line style={{ color: '#f43f5e' }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Editar Receita' : 'Nova Receita'}
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="form-label">Tipo</label>
              <select id="income-type" className="form-input" {...register('type')}>
                <option value="salary">Salário</option>
                <option value="extra">Extra</option>
                <option value="other">Outro</option>
              </select>
            </div>
            <div>
              <label className="form-label">Moeda</label>
              <select id="income-currency" className="form-input" {...register('currency')}>
                <option value="BRL">BRL — Real</option>
                <option value="USD">USD — Dólar</option>
                <option value="EUR">EUR — Euro</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label">Descrição</label>
            <input id="income-desc" type="text" className="form-input" placeholder="Ex: Salário Janeiro" {...register('description')} />
            {errors.description && <p className="form-error">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="form-label">Valor ({currency})</label>
              <input id="income-amount" type="number" step="0.01" className="form-input" placeholder="0,00" {...register('amount')} />
              {errors.amount && <p className="form-error">{errors.amount.message}</p>}
            </div>
            {currency !== 'BRL' && (
              <div>
                <label className="form-label">Taxa (1 {currency} = ? BRL)</label>
                <input type="number" step="0.0001" className="form-input" placeholder="5.50" {...register('exchange_rate')} />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="form-label">Mês</label>
              <input type="number" min="1" max="12" className="form-input" {...register('month')} />
            </div>
            <div>
              <label className="form-label">Ano</label>
              <input type="number" min="2000" max="2100" className="form-input" {...register('year')} />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label">Observações</label>
            <textarea className="form-input" rows={2} {...register('notes')} />
          </div>

          <label className="flex items-center gap-2 mb-6 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 accent-indigo-500" {...register('is_recurring')} />
            <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Receita recorrente (se repete todo mês)</span>
          </label>

          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => setModalOpen(false)} className="btn btn-ghost">Cancelar</button>
            <button type="submit" id="btn-save-income" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? <div className="spinner" style={{ width: '16px', height: '16px' }} /> : null}
              {editing ? 'Salvar' : 'Adicionar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default IncomesPage;
