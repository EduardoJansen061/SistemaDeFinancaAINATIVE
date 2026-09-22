import { RiMenuLine, RiCalendarLine, RiArrowLeftSLine, RiArrowRightSLine } from 'react-icons/ri';

const Header = ({ onMenuClick, title, subtitle, monthNav }) => {
  return (
    <header className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="btn btn-ghost btn-icon md:hidden"
          aria-label="Abrir menu"
        >
          <RiMenuLine className="text-xl" />
        </button>

        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Plus Jakarta Sans' }}>
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Month Navigator */}
      {monthNav && (
        <div className="flex items-center gap-2">
          <button
            onClick={monthNav.prev}
            className="btn btn-ghost btn-icon btn-sm"
            aria-label="Mês anterior"
          >
            <RiArrowLeftSLine className="text-lg" />
          </button>

          <div className="glass-card px-4 py-2 flex items-center gap-2">
            <RiCalendarLine style={{ color: 'var(--color-accent-primary)' }} />
            <span className="text-sm font-semibold capitalize">{monthNav.label}</span>
          </div>

          <button
            onClick={monthNav.next}
            className="btn btn-ghost btn-icon btn-sm"
            aria-label="Próximo mês"
          >
            <RiArrowRightSLine className="text-lg" />
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
