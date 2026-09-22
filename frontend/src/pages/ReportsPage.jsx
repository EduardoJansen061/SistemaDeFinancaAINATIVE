import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { RiDownload2Line, RiFilePdfLine, RiFileExcelLine } from 'react-icons/ri';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, Tooltip, Legend, Filler,
} from 'chart.js';
import Header from '../components/Header';
import { summaryService } from '../services';
import { useMonthNav } from '../hooks/useApi';
import { formatCurrency, monthName } from '../utils/formatters';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Legend, Filler);

const ReportsPage = () => {
  const { onMenuClick } = useOutletContext();
  const monthNav = useMonthNav();
  const [summary, setSummary] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, [monthNav.month, monthNav.year]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await summaryService.get(monthNav.year, monthNav.month);
      setSummary(res.data.summary);
      setHistory(res.data.history || []);
    } catch { toast.error('Erro ao carregar relatório.'); }
    finally { setLoading(false); }
  };

  const exportCSV = () => {
    if (!summary) return;
    const rows = [
      ['Período', monthName(monthNav.month, monthNav.year)],
      ['Total Receitas (BRL)', summary.total_income_brl],
      ['Total Despesas (BRL)', summary.total_expenses_brl],
      ['Total Investimentos (BRL)', summary.total_investments_brl],
      ['Saldo Disponível (BRL)', summary.balance_brl],
      [],
      ['Histórico 6 Meses'],
      ['Mês/Ano', 'Receitas', 'Despesas', 'Investimentos', 'Saldo'],
      ...history.map(h => [h.label, h.total_income_brl, h.total_expenses_brl, h.total_investments_brl, h.balance_brl]),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financaspro_${monthNav.year}_${String(monthNav.month).padStart(2, '0')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exportado!');
  };

  const exportPDF = () => {
    window.print();
    toast.success('Janela de impressão aberta (salve como PDF).');
  };

  const lineData = {
    labels: history.map(h => h.label),
    datasets: [
      {
        label: 'Receitas',
        data: history.map(h => h.total_income_brl),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16,185,129,0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Despesas',
        data: history.map(h => h.total_expenses_brl),
        borderColor: '#f43f5e',
        backgroundColor: 'rgba(244,63,94,0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Saldo',
        data: history.map(h => h.balance_brl),
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99,102,241,0.1)',
        fill: true,
        tension: 0.4,
        borderDash: [4, 2],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#94a3b8', font: { family: 'Inter', size: 11 } } },
      tooltip: { callbacks: { label: (ctx) => ` ${formatCurrency(ctx.parsed.y)}` } },
    },
    scales: {
      x: { ticks: { color: '#475569' }, grid: { color: 'rgba(99,102,241,0.07)' } },
      y: { ticks: { color: '#475569', callback: (v) => `R$ ${(v/1000).toFixed(1)}k` }, grid: { color: 'rgba(99,102,241,0.07)' } },
    },
  };

  const s = summary;

  return (
    <div>
      <Header
        title="Relatórios"
        subtitle="Análise financeira detalhada"
        monthNav={monthNav}
        onMenuClick={onMenuClick}
      />

      {/* Export Buttons */}
      <div className="flex gap-3 mb-6 justify-end">
        <button id="btn-export-csv" onClick={exportCSV} className="btn btn-ghost btn-sm">
          <RiFileExcelLine style={{ color: '#10b981' }} /> Exportar CSV
        </button>
        <button id="btn-export-pdf" onClick={exportPDF} className="btn btn-ghost btn-sm">
          <RiFilePdfLine style={{ color: '#f43f5e' }} /> Exportar PDF
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="spinner" style={{ width: '40px', height: '40px' }} />
        </div>
      ) : (
        <>
          {/* Summary Table */}
          <div className="glass-card p-6 mb-6" data-aos="fade-up">
            <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--color-text-secondary)' }}>
              Resumo — {monthName(monthNav.month, monthNav.year)}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Receitas', value: s?.total_income_brl, color: '#10b981' },
                { label: 'Despesas', value: s?.total_expenses_brl, color: '#f43f5e' },
                { label: 'Investimentos', value: s?.total_investments_brl, color: '#6366f1' },
                { label: 'Saldo', value: s?.balance_brl, color: parseFloat(s?.balance_brl) >= 0 ? '#10b981' : '#f43f5e' },
              ].map(({ label, value, color }) => (
                <div key={label} className="p-4 rounded-xl text-center" style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.12)' }}>
                  <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
                  <p className="text-xl font-bold" style={{ color }}>{formatCurrency(value || 0)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Line Chart */}
          <div className="glass-card p-6 mb-6" data-aos="fade-up" data-aos-delay="100">
            <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--color-text-secondary)' }}>
              Tendência — últimos 6 meses
            </h3>
            <div style={{ height: '280px' }}>
              <Line data={lineData} options={chartOptions} />
            </div>
          </div>

          {/* History Table */}
          <div className="glass-card overflow-hidden" data-aos="fade-up" data-aos-delay="200">
            <div className="p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                Histórico Detalhado
              </h3>
            </div>
            <table className="data-table" aria-label="Histórico financeiro">
              <thead>
                <tr>
                  <th>Período</th>
                  <th>Receitas</th>
                  <th>Despesas</th>
                  <th>Investimentos</th>
                  <th>Saldo</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.label}>
                    <td className="font-semibold text-white capitalize">{h.label}</td>
                    <td className="amount-positive font-mono">{formatCurrency(h.total_income_brl)}</td>
                    <td className="amount-negative font-mono">{formatCurrency(h.total_expenses_brl)}</td>
                    <td className="font-mono" style={{ color: '#6366f1' }}>{formatCurrency(h.total_investments_brl)}</td>
                    <td className={`font-bold font-mono ${parseFloat(h.balance_brl) >= 0 ? 'amount-positive' : 'amount-negative'}`}>
                      {formatCurrency(h.balance_brl)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default ReportsPage;
