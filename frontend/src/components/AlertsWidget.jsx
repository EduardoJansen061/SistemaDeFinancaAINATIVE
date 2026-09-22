import { RiAlertLine, RiErrorWarningLine, RiTimeLine } from 'react-icons/ri';
import { formatCurrency } from '../utils/formatters';

/**
 * Alert widget for upcoming/overdue expenses
 */
const AlertsWidget = ({ upcoming = [], overdue = [] }) => {
  if (!upcoming.length && !overdue.length) return null;

  return (
    <div className="glass-card p-5" data-aos="fade-up" data-aos-delay="400">
      <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
        <RiAlertLine style={{ color: 'var(--color-accent-amber)' }} />
        Alertas de Vencimento
      </h3>

      <div className="flex flex-col gap-3">
        {overdue.map((e) => (
          <div key={e.id} className="alert-widget alert-danger flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RiErrorWarningLine style={{ color: '#f43f5e', flexShrink: 0 }} />
              <div>
                <p className="text-sm font-medium text-white">{e.description}</p>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  Venceu dia {e.due_day} — {formatCurrency(e.amount_brl)}
                </p>
              </div>
            </div>
            <span className="badge badge-rose">Vencida</span>
          </div>
        ))}

        {upcoming.map((e) => {
          const daysLeft = e.due_day - new Date().getDate();
          return (
            <div key={e.id} className="alert-widget alert-warning flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RiTimeLine style={{ color: '#f59e0b', flexShrink: 0 }} />
                <div>
                  <p className="text-sm font-medium text-white">{e.description}</p>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    Vence em {daysLeft === 0 ? 'hoje' : `${daysLeft} dia${daysLeft > 1 ? 's' : ''}`} — {formatCurrency(e.amount_brl)}
                  </p>
                </div>
              </div>
              <span className="badge badge-amber">{daysLeft === 0 ? 'Hoje' : `${daysLeft}d`}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AlertsWidget;
