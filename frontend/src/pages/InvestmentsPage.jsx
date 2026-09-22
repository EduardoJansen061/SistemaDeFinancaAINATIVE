import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { RiAddLine, RiDeleteBin2Line, RiEditLine, RiLineChartLine } from 'react-icons/ri';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler,
} from 'chart.js';
import Header from '../components/Header';
import Modal from '../components/Modal';
import { investmentsService } from '../services';
import { useMonthNav } from '../hooks/useApi';
import { formatCurrency, investmentTypeLabel } from '../utils/formatters';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

const schema = z.object({
  name: z.string().min(2),
  type: z.enum(['stocks', 'crypto', 'fixed_income', 'savings', 'real_estate', 'other']),
  ticker: z.string().optional(),
  amount_invested: z.coerce.number().positive('Valor positivo'),
  current_value: z.coerce.number().min(0).optional().nullable(),
  currency: z.enum(['BRL', 'USD', 'EUR']).default('BRL'),
  exchange_rate: z.coerce.number().positive().optional(),
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2000).max(2100),
  notes: z.string().optional(),
});

const TYPE_COLORS = {
  stocks: '#6366f1',
  crypto: '#f59e0b',
  fixed_income: '#10b981',
  savings: '#06b6d4',
  real_estate: '#8b5cf6',
  other: '#6b7280',
};

const InvestmentsPage = () => {
  const { onMenuClick } = useOutletContext();
  const monthNav = useMonthNav();
  const [investments, setInvestments] = useState([]);
  const [summary, setSummary] = useState({ total_invested_brl: 0, total_current_brl: 0, profit_loss: 0, profit_loss_pct: '0.00' });
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { type: 'stocks', currency: 'BRL', exchange_rate: 1, month: monthNav.month, year: monthNav.year },
  });

  const currency = watch('currency');

  useEffect(() => { fetchInvestments(); }, [monthNav.month, monthNav.year]);

  const fetchInvestments = async () => {
    setLoading(true);
    try {
      const res = await investmentsService.list({ month: monthNav.month, year: monthNav.year });
      setInvestments(res.data.investments);
      setSummary(res.data.summary);
    } catch { toast.error('Erro ao carregar investimentos.'); }
    finally { setLoading(false); }
  };

  const openCreate = () => {
    setEditing(null);
    reset({ type: 'stocks', currency: 'BRL', exchange_rate: 1, month: monthNav.month, year: monthNav.year });
    setModalOpen(true);
  };

  const openEdit = (inv) => {
    setEditing(inv);
    reset({
      name: inv.name, type: inv.type, ticker: inv.ticker || '',
      amount_invested: parseFloat(inv.amount_invested),
      current_value: inv.current_value ? parseFloat(inv.current_value) : '',
      currency: inv.currency, exchange_rate: parseFloat(inv.exchange_rate),
      month: inv.month, year: inv.year, notes: inv.notes || '',
    });
    setModalOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      if (editing) {
        await investmentsService.update(editing.id, data);
        toast.success('Investimento atualizado!');
      } else {
        await investmentsService.create(data);
        toast.success('Investimento adicionado!');
      }
      setModalOpen(false);
      fetchInvestments();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao salvar.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remover este investimento?')) return;
    try {
      await investmentsService.remove(id);
      toast.success('Investimento removido.');
      fetchInvestments();
    } catch { toast.error('Erro ao remover.'); }
  };

  const profitIsPositive = parseFloat(summary.profit_loss) >= 0;

  return (
    <div>
      <Header
        title="Investimentos"
        subtitle="Ações, cripto, renda fixa e mais"
        monthNav={monthNav}
        onMenuClick={onMenuClick}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="glass-card p-5" data-aos="fade-up">
          <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-muted)' }}>Total Investido</p>
          <p className="text-2xl font-bold">{formatCurrency(summary.total_invested_brl)}</p>
        </div>
        <div className="glass-card p-5" data-aos="fade-up" data-aos-delay="100">
          <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-muted)' }}>Valor Atual</p>
          <p className="text-2xl font-bold">{formatCurrency(summary.total_current_brl)}</p>
        </div>
        <div className="glass-card p-5" data-aos="fade-up" data-aos-delay="200">
          <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-muted)' }}>
            Resultado ({summary.profit_loss_pct}%)
          </p>
          <p className={`text-2xl font-bold ${profitIsPositive ? 'amount-positive' : 'amount-negative'}`}>
            {profitIsPositive ? '+' : ''}{formatCurrency(summary.profit_loss)}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end mb-5">
        <button id="btn-add-investment" onClick={openCreate} className="btn btn-primary btn-sm">
          <RiAddLine /> Novo Investimento
        </button>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden" data-aos="fade-up">
        {loading ? (
          <div className="flex justify-center p-12">
            <div className="spinner" style={{ width: '32px', height: '32px' }} />
          </div>
        ) : investments.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16">
            <RiLineChartLine style={{ fontSize: '3rem', color: 'var(--color-text-muted)', marginBottom: '12px' }} />
            <p style={{ color: 'var(--color-text-muted)' }}>Nenhum investimento registrado neste mês.</p>
            <button onClick={openCreate} className="btn btn-primary btn-sm mt-4">
              <RiAddLine /> Adicionar investimento
            </button>
          </div>
        ) : (
          <table className="data-table" aria-label="Tabela de investimentos">
            <thead>
              <tr>
                <th>Ativo</th>
                <th>Tipo</th>
                <th>Investido</th>
                <th>Valor Atual</th>
                <th>Resultado</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {investments.map((inv) => {
                const current = inv.current_value ? parseFloat(inv.current_value) : parseFloat(inv.amount_brl);
                const invested = parseFloat(inv.amount_brl);
                const pl = current - invested;
                const plPct = invested > 0 ? ((pl / invested) * 100).toFixed(2) : '0.00';
                const color = TYPE_COLORS[inv.type] || '#6b7280';
                return (
                  <tr key={inv.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                          style={{ background: color + '26', color }}>
                          {(inv.ticker || inv.name).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-white">{inv.name}</p>
                          {inv.ticker && <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{inv.ticker}</p>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge" style={{ background: color + '1a', color }}>
                        {investmentTypeLabel(inv.type)}
                      </span>
                    </td>
                    <td className="font-mono">{formatCurrency(inv.amount_brl)}</td>
                    <td className="font-mono">{formatCurrency(current)}</td>
                    <td>
                      <span className={`font-semibold text-sm ${pl >= 0 ? 'amount-positive' : 'amount-negative'}`}>
                        {pl >= 0 ? '+' : ''}{formatCurrency(pl)} ({pl >= 0 ? '+' : ''}{plPct}%)
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(inv)} className="btn btn-ghost btn-icon btn-sm" aria-label="Editar">
                          <RiEditLine />
                        </button>
                        <button onClick={() => handleDelete(inv.id)} className="btn btn-ghost btn-icon btn-sm" aria-label="Remover">
                          <RiDeleteBin2Line style={{ color: '#f43f5e' }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Investimento' : 'Novo Investimento'}>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="form-label">Nome do Ativo</label>
              <input id="inv-name" type="text" className="form-input" placeholder="Ex: Tesouro Selic" {...register('name')} />
              {errors.name && <p className="form-error">{errors.name.message}</p>}
            </div>
            <div>
              <label className="form-label">Ticker (opcional)</label>
              <input type="text" className="form-input" placeholder="Ex: PETR4" {...register('ticker')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="form-label">Tipo</label>
              <select id="inv-type" className="form-input" {...register('type')}>
                <option value="stocks">Ações</option>
                <option value="crypto">Criptomoedas</option>
                <option value="fixed_income">Renda Fixa</option>
                <option value="savings">Poupança</option>
                <option value="real_estate">Imóveis</option>
                <option value="other">Outros</option>
              </select>
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

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="form-label">Valor Aportado</label>
              <input id="inv-amount" type="number" step="0.01" className="form-input" placeholder="0,00" {...register('amount_invested')} />
              {errors.amount_invested && <p className="form-error">{errors.amount_invested.message}</p>}
            </div>
            <div>
              <label className="form-label">Valor Atual (opcional)</label>
              <input type="number" step="0.01" className="form-input" placeholder="0,00" {...register('current_value')} />
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
              <label className="form-label">Mês</label>
              <input type="number" min="1" max="12" className="form-input" {...register('month')} />
            </div>
            <div>
              <label className="form-label">Ano</label>
              <input type="number" min="2000" max="2100" className="form-input" {...register('year')} />
            </div>
          </div>

          <div className="mb-6">
            <label className="form-label">Observações</label>
            <textarea className="form-input" rows={2} {...register('notes')} />
          </div>

          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => setModalOpen(false)} className="btn btn-ghost">Cancelar</button>
            <button type="submit" id="btn-save-investment" className="btn btn-primary" disabled={isSubmitting}>
              {editing ? 'Salvar' : 'Adicionar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default InvestmentsPage;
