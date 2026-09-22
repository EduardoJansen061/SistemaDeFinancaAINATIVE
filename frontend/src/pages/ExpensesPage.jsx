import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import {
  RiAddLine, RiDeleteBin2Line, RiEditLine, RiCheckLine, RiBankCardLine,
} from 'react-icons/ri';
import Header from '../components/Header';
import Modal from '../components/Modal';
import { expensesService, categoriesService } from '../services';
import { useMonthNav } from '../hooks/useApi';
import { formatCurrency } from '../utils/formatters';

const schema = z.object({
  description: z.string().min(2, 'Mínimo 2 caracteres'),
  amount: z.coerce.number().positive('Valor positivo'),
  currency: z.enum(['BRL', 'USD', 'EUR']).default('BRL'),
  exchange_rate: z.coerce.number().positive().optional(),
  category_id: z.string().optional(),
  due_day: z.coerce.number().int().min(1).max(31).optional().nullable(),
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2000).max(2100),
  is_recurring: z.boolean().default(false),
  is_installment: z.boolean().default(false),
  total_installments: z.coerce.number().int().min(2).max(360).optional().nullable(),
  notes: z.string().optional(),
});

const ExpensesPage = () => {
  const { onMenuClick } = useOutletContext();
  const monthNav = useMonthNav();
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState({ total_brl: 0, total_paid_brl: 0, total_pending_brl: 0 });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filterPaid, setFilterPaid] = useState('all');

  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      currency: 'BRL', exchange_rate: 1, month: monthNav.month, year: monthNav.year,
      is_recurring: false, is_installment: false,
    },
  });

  const isInstallment = watch('is_installment');
  const currency = watch('currency');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [monthNav.month, monthNav.year, filterPaid]);

  const fetchCategories = async () => {
    try {
      const res = await categoriesService.list();
      setCategories(res.data.categories);
    } catch { }
  };

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const params = { month: monthNav.month, year: monthNav.year };
      if (filterPaid !== 'all') params.paid = filterPaid === 'paid';
      const res = await expensesService.list(params);
      setExpenses(res.data.expenses);
      setSummary(res.data.summary);
    } catch { toast.error('Erro ao carregar despesas.'); }
    finally { setLoading(false); }
  };

  const openCreate = () => {
    setEditing(null);
    reset({ currency: 'BRL', exchange_rate: 1, month: monthNav.month, year: monthNav.year, is_recurring: false, is_installment: false });
    setModalOpen(true);
  };

  const openEdit = (expense) => {
    setEditing(expense);
    reset({
      description: expense.description, amount: parseFloat(expense.amount),
      currency: expense.currency, exchange_rate: parseFloat(expense.exchange_rate),
      category_id: expense.category_id || '', due_day: expense.due_day,
      month: expense.month, year: expense.year,
      is_recurring: expense.is_recurring, notes: expense.notes || '',
    });
    setModalOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      if (editing) {
        await expensesService.update(editing.id, data);
        toast.success('Despesa atualizada!');
      } else {
        const res = await expensesService.create(data);
        if (data.is_installment) {
          toast.success(`${data.total_installments} parcelas criadas!`);
        } else {
          toast.success('Despesa adicionada!');
        }
      }
      setModalOpen(false);
      fetchExpenses();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao salvar.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remover esta despesa?')) return;
    try {
      await expensesService.remove(id);
      toast.success('Despesa removida.');
      fetchExpenses();
    } catch { toast.error('Erro ao remover.'); }
  };

  const handlePay = async (id) => {
    try {
      await expensesService.pay(id);
      toast.success('Marcado como pago!');
      fetchExpenses();
    } catch { toast.error('Erro.'); }
  };

  const filtered = expenses;

  return (
    <div>
      <Header
        title="Despesas"
        subtitle="Dívidas, contas e parcelamentos"
        monthNav={monthNav}
        onMenuClick={onMenuClick}
      />

      {/* Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total', value: summary.total_brl, color: 'var(--color-text-primary)' },
          { label: 'Pagas', value: summary.total_paid_brl, color: '#10b981' },
          { label: 'Pendentes', value: summary.total_pending_brl, color: '#f59e0b' },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass-card p-4 flex items-center justify-between" data-aos="fade-up">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>{label}</span>
            <span className="text-lg font-bold" style={{ color }}>{formatCurrency(value)}</span>
          </div>
        ))}
      </div>

      {/* Actions Bar */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        {/* Filter */}
        <div className="flex items-center gap-2">
          {[['all', 'Todas'], ['pending', 'Pendentes'], ['paid', 'Pagas']].map(([val, lbl]) => (
            <button
              key={val}
              onClick={() => setFilterPaid(val)}
              className={`btn btn-sm ${filterPaid === val ? 'btn-primary' : 'btn-ghost'}`}
            >
              {lbl}
            </button>
          ))}
        </div>
        <button id="btn-add-expense" onClick={openCreate} className="btn btn-primary btn-sm">
          <RiAddLine /> Adicionar Despesa
        </button>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden" data-aos="fade-up" data-aos-delay="100">
        {loading ? (
          <div className="flex justify-center p-12">
            <div className="spinner" style={{ width: '32px', height: '32px' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16">
            <RiBankCardLine style={{ fontSize: '3rem', color: 'var(--color-text-muted)', marginBottom: '12px' }} />
            <p style={{ color: 'var(--color-text-muted)' }}>Nenhuma despesa registrada neste mês.</p>
            <button onClick={openCreate} className="btn btn-primary btn-sm mt-4">
              <RiAddLine /> Adicionar despesa
            </button>
          </div>
        ) : (
          <table className="data-table" aria-label="Tabela de despesas">
            <thead>
              <tr>
                <th>Descrição</th>
                <th>Categoria</th>
                <th>Venc.</th>
                <th>Valor</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((exp) => (
                <tr key={exp.id}>
                  <td>
                    <p className="font-medium text-white">{exp.description}</p>
                    <div className="flex gap-1 mt-1">
                      {exp.is_recurring && <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>Recorrente</span>}
                      {exp.is_installment && (
                        <span className="badge badge-indigo" style={{ fontSize: '0.65rem' }}>
                          {exp.current_installment}/{exp.total_installments}x
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    {exp.category ? (
                      <span className="badge" style={{
                        background: exp.category.color + '26',
                        color: exp.category.color,
                      }}>
                        {exp.category.name}
                      </span>
                    ) : <span style={{ color: 'var(--color-text-muted)' }}>—</span>}
                  </td>
                  <td>
                    {exp.due_day ? (
                      <span className="text-sm">Dia {exp.due_day}</span>
                    ) : '—'}
                  </td>
                  <td className="font-mono amount-negative font-semibold">
                    {formatCurrency(exp.amount_brl)}
                  </td>
                  <td>
                    {exp.paid
                      ? <span className="badge badge-green">Pago</span>
                      : <span className="badge badge-amber">Pendente</span>}
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      {!exp.paid && (
                        <button onClick={() => handlePay(exp.id)} className="btn btn-ghost btn-icon btn-sm" title="Marcar pago" aria-label="Marcar como pago">
                          <RiCheckLine style={{ color: '#10b981' }} />
                        </button>
                      )}
                      <button onClick={() => openEdit(exp)} className="btn btn-ghost btn-icon btn-sm" aria-label="Editar">
                        <RiEditLine />
                      </button>
                      <button onClick={() => handleDelete(exp.id)} className="btn btn-ghost btn-icon btn-sm" aria-label="Remover">
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
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Despesa' : 'Nova Despesa'}>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="mb-4">
            <label className="form-label">Descrição</label>
            <input id="expense-desc" type="text" className="form-input" placeholder="Ex: Aluguel" {...register('description')} />
            {errors.description && <p className="form-error">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="form-label">Valor</label>
              <input id="expense-amount" type="number" step="0.01" className="form-input" placeholder="0,00" {...register('amount')} />
              {errors.amount && <p className="form-error">{errors.amount.message}</p>}
            </div>
            <div>
              <label className="form-label">Moeda</label>
              <select className="form-input" {...register('currency')}>
                <option value="BRL">BRL</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>

          {currency !== 'BRL' && (
            <div className="mb-4">
              <label className="form-label">Taxa de câmbio (1 {currency} = ? BRL)</label>
              <input type="number" step="0.0001" className="form-input" {...register('exchange_rate')} />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="form-label">Categoria</label>
              <select className="form-input" {...register('category_id')}>
                <option value="">Sem categoria</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Dia de Vencimento</label>
              <input type="number" min="1" max="31" className="form-input" placeholder="5" {...register('due_day')} />
            </div>
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

          {!editing && (
            <div className="mb-4 p-4 rounded-xl" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}>
              <label className="flex items-center gap-2 mb-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 accent-indigo-500" {...register('is_installment')} />
                <span className="text-sm font-medium text-white">Parcelado</span>
              </label>
              {isInstallment && (
                <div>
                  <label className="form-label">Nº de parcelas</label>
                  <input id="expense-installments" type="number" min="2" max="360" className="form-input" placeholder="Ex: 12" {...register('total_installments')} />
                  {errors.total_installments && <p className="form-error">{errors.total_installments.message}</p>}
                </div>
              )}
              {!isInstallment && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 accent-indigo-500" {...register('is_recurring')} />
                  <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Recorrente (mensal)</span>
                </label>
              )}
            </div>
          )}

          <div className="mb-6">
            <label className="form-label">Observações</label>
            <textarea className="form-input" rows={2} {...register('notes')} />
          </div>

          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => setModalOpen(false)} className="btn btn-ghost">Cancelar</button>
            <button type="submit" id="btn-save-expense" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? <div className="spinner" style={{ width: '16px', height: '16px' }} /> : null}
              {editing ? 'Salvar' : isInstallment ? 'Criar Parcelas' : 'Adicionar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ExpensesPage;

