import { formatCurrency } from '../utils/formatters';

/**
 * Card de estatística no Dashboard
 */
const StatCard = ({
  title,
  value,
  currency = 'BRL',
  subtitle,
  icon: Icon,
  trend,
  trendLabel,
  variant = 'default', // 'default' | 'green' | 'amber' | 'rose'
  delay = 0,
}) => {
  const isPositiveTrend = parseFloat(trend) > 0;
  const trendColor = isPositiveTrend ? '#10b981' : '#f43f5e';

  return (
    <div
      className={`stat-card ${variant}`}
      data-aos="fade-up"
      data-aos-delay={delay}
    >
      {/* Background glow */}
      <div className="absolute inset-0 opacity-5 rounded-2xl" aria-hidden="true"
        style={{
          background: variant === 'green' ? 'radial-gradient(circle at 70% 70%, #10b981, transparent)'
            : variant === 'amber' ? 'radial-gradient(circle at 70% 70%, #f59e0b, transparent)'
            : variant === 'rose' ? 'radial-gradient(circle at 70% 70%, #f43f5e, transparent)'
            : 'radial-gradient(circle at 70% 70%, #6366f1, transparent)',
        }}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <p className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: 'var(--color-text-muted)' }}>
            {title}
          </p>
          {Icon && (
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: variant === 'green' ? 'rgba(16,185,129,0.15)'
                  : variant === 'amber' ? 'rgba(245,158,11,0.15)'
                  : variant === 'rose' ? 'rgba(244,63,94,0.15)'
                  : 'rgba(99,102,241,0.15)',
              }}>
              <Icon className="text-xl"
                style={{
                  color: variant === 'green' ? '#10b981'
                    : variant === 'amber' ? '#f59e0b'
                    : variant === 'rose' ? '#f43f5e'
                    : '#6366f1',
                }}
              />
            </div>
          )}
        </div>

        {/* Value */}
        <p className="text-3xl font-bold mb-1" style={{ fontFamily: 'Plus Jakarta Sans' }}>
          {formatCurrency(value, currency)}
        </p>

        {/* Subtitle / Trend */}
        <div className="flex items-center gap-2">
          {subtitle && (
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {subtitle}
            </p>
          )}
          {trend !== undefined && (
            <span className="text-xs font-semibold" style={{ color: trendColor }}>
              {isPositiveTrend ? '↑' : '↓'} {Math.abs(trend)}% {trendLabel}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
