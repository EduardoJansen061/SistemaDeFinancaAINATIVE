import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import AOS from 'aos';
import 'aos/dist/aos.css';
import {
  RiMoneyDollarCircleLine, RiBankCardLine, RiLineChartLine,
  RiWalletLine, RiRefreshLine,
} from 'react-icons/ri';
import Header from '../components/Header';
import StatCard from '../components/StatCard';
import AlertsWidget from '../components/AlertsWidget';
import { summaryService, expensesService } from '../services';
import { useMonthNav } from '../hooks/useApi';
import { formatCurrency } from '../utils/formatters';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler);

const CHART_COLORS = {
  income: '#10b981',
  expenses: '#f43f5e',
  investments: '#6366f1',
  balance: '#06b6d4',
};

const DashboardPage = () => {
  const { onMenuClick } = useOutletContext();
  const monthNav = useMonthNav();
  const [summary, setSummary] = useState(null);
  const [history, setHistory] = useState([]);
  const [alerts, setAlerts] = useState({ upcoming: [], overdue: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AOS.init({ duration: 600, once: true, easing: 'ease-out-cubic' });
  }, []);

  useEffect(() => {
    fetchData();
  }, [monthNav.month, monthNav.year]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [summaryRes, alertsRes] = await Promise.all([
        summaryService.get(monthNav.year, monthNav.month),
        expensesService.upcoming(),
      ]);
      setSummary(summaryRes.data.summary);
      setHistory(summaryRes.data.history || []);
      setAlerts({
        upcoming: alertsRes.data.upcoming || [],
        overdue: alertsRes.data.overdue || [],
      });
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // === Chart Data ===
  const doughnutData = {
    labels: ['Receitas', 'Despesas', 'Investimentos'],
    datasets: [{
      data: summary ? [
        parseFloat(summary.total_income_brl),
        parseFloat(summary.total_expenses_brl),
        parseFloat(summary.total_investments_brl),
      ] : [0, 0, 0],
      backgroundColor: [CHART_COLORS.income, CHART_COLORS.expenses, CHART_COLORS.investments],
      borderColor: 'transparent',
      hoverOffset: 8,
    }],
  };

  const barData = {
    labels: history.map(h => h.label),
    datasets: [
      {
        label: 'Receitas',
        data: history.map(h => h.total_income_brl),
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
        borderRadius: 6,
      },
      {
        label: 'Despesas',
        data: history.map(h => h.total_expenses_brl),
        backgroundColor: 'rgba(244, 63, 94, 0.7)',
        borderRadius: 6,
      },
      {
        label: 'Investimentos',
        data: history.map(h => h.total_investments_brl),
        backgroundColor: 'rgba(99, 102, 241, 0.7)',
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#94a3b8', font: { family: 'Inter', size: 12 } },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${formatCurrency(ctx.parsed.y || ctx.parsed)}`,
        },
      },
    },
    scales: {
      x: { ticks: { color: '#475569' }, grid: { color: 'rgba(99,102,241,0.07)' } },
      y: { ticks: { color: '#475569', callback: (v) => `R$ ${(v/1000).toFixed(0)}k` }, grid: { color: 'rgba(99,102,241,0.07)' } },
    },
  };

  const s = summary;

  return (
    <div>
      <Header
        title="Dashboard"
        subtitle={`Visão geral de ${monthNav.label}`}
        monthNav={monthNav}
        onMenuClick={onMenuClick}
      />

      {loading ? (
        <div className="flex items-center justify-center" style={{ height: '400px' }}>
          <div className="spinner" style={{ width: '40px', height: '40px' }} />
        </div>
      ) : (
        <>
          {/* === Stat Cards === */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
            <StatCard
              title="Total Recebido"
              value={s?.total_income_brl || 0}
              icon={RiMoneyDollarCircleLine}
              variant="green"
              delay={0}
            />
            <StatCard
              title="Total de Despesas"
              value={s?.total_expenses_brl || 0}
              icon={RiBankCardLine}
              variant="rose"
              delay={100}
            />
            <StatCard
              title="Investimentos"
              value={s?.total_investments_brl || 0}
              icon={RiLineChartLine}
              variant="default"
              delay={200}
            />
            <StatCard
              title="Saldo Disponível"
              value={s?.balance_brl || 0}
              icon={RiWalletLine}
              variant={parseFloat(s?.balance_brl) >= 0 ? 'amber' : 'rose'}
              delay={300}
            />
          </div>

          {/* === Charts Row === */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
            {/* Doughnut */}
            <div className="glass-card p-6" data-aos="fade-up" data-aos-delay="200">
              <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                Distribuição do Mês
              </h3>
              <div style={{ height: '220px' }}>
                <Doughnut
                  data={doughnutData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'bottom', labels: { color: '#94a3b8', padding: 16, font: { size: 11 } } },
                      tooltip: { callbacks: { label: (ctx) => ` ${formatCurrency(ctx.parsed)}` } },
                    },
                    cutout: '65%',
                  }}
                />
              </div>
            </div>

            {/* Bar Chart — History */}
            <div className="glass-card p-6 lg:col-span-2" data-aos="fade-up" data-aos-delay="300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                  Histórico 6 Meses
                </h3>
                <button onClick={fetchData} className="btn btn-ghost btn-icon btn-sm" title="Atualizar">
                  <RiRefreshLine />
                </button>
              </div>
              <div style={{ height: '220px' }}>
                <Bar data={barData} options={chartOptions} />
              </div>
            </div>
          </div>

          {/* === Alerts + Balance Summary === */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Balance Detail */}
            <div className="glass-card p-6 lg:col-span-2" data-aos="fade-up" data-aos-delay="350">
              <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                Resumo Financeiro — {monthNav.label}
              </h3>

              {[
                { label: 'Total de receitas', value: s?.total_income_brl, color: '#10b981', pct: 100 },
                { label: 'Total de despesas', value: s?.total_expenses_brl, color: '#f43f5e',
                  pct: s ? (parseFloat(s.total_expenses_brl) / parseFloat(s.total_income_brl || 1)) * 100 : 0 },
                { label: 'Investimentos', value: s?.total_investments_brl, color: '#6366f1',
                  pct: s ? (parseFloat(s.total_investments_brl) / parseFloat(s.total_income_brl || 1)) * 100 : 0 },
              ].map(({ label, value, color, pct }) => (
                <div key={label} className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>{label}</span>
                    <span className="text-sm font-bold" style={{ color }}>{formatCurrency(value || 0)}</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${Math.min(100, pct || 0).toFixed(1)}%`, background: color }}
                    />
                  </div>
                </div>
              ))}

              <div className="mt-5 pt-4 border-t flex items-center justify-between"
                style={{ borderColor: 'var(--color-border)' }}>
                <span className="text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                  Saldo final
                </span>
                <span className={`text-xl font-bold ${parseFloat(s?.balance_brl) >= 0 ? 'amount-positive' : 'amount-negative'}`}>
                  {formatCurrency(s?.balance_brl || 0)}
                </span>
              </div>
            </div>

            {/* Alerts */}
            <AlertsWidget upcoming={alerts.upcoming} overdue={alerts.overdue} />
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;

