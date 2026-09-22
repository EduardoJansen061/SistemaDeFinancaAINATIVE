import { NavLink, useNavigate } from 'react-router-dom';
import {
  RiDashboardLine, RiMoneyDollarCircleLine, RiBankCardLine,
  RiLineChartLine, RiBarChartLine, RiSettings3Line, RiLogoutBoxLine,
  RiCloseLine, RiPulseLine,
} from 'react-icons/ri';
import { useAuth } from '../hooks/useAuth';

const navItems = [
  { to: '/',           icon: RiDashboardLine,        label: 'Dashboard' },
  { to: '/receitas',   icon: RiMoneyDollarCircleLine, label: 'Receitas' },
  { to: '/despesas',   icon: RiBankCardLine,       label: 'Despesas' },
  { to: '/investimentos', icon: RiLineChartLine,      label: 'Investimentos' },
  { to: '/relatorios', icon: RiBarChartLine,          label: 'Relatórios' },
];

const Sidebar = ({ open, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`sidebar ${open ? 'open' : ''}`}>
        {/* Logo */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--gradient-primary)' }}>
              <RiPulseLine className="text-white text-lg" />
            </div>
            <div>
              <span className="font-bold text-sm text-white block" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                Finanças<span style={{ color: 'var(--color-accent-primary)' }}>PRO</span>
              </span>
              <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Personal Finance</span>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-icon md:hidden">
            <RiCloseLine />
          </button>
        </div>

        {/* User info */}
        <div className="glass-card p-3 mb-6 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
            style={{ background: 'var(--gradient-primary)' }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
            <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>{user?.email}</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 flex-1">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2 px-3"
            style={{ color: 'var(--color-text-muted)' }}>
            Menu
          </p>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `sidebar-nav-item ${isActive ? 'active' : ''}`
              }
              onClick={onClose}
            >
              <Icon className="text-lg flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="flex flex-col gap-1 mt-4 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <NavLink to="/configuracoes" className="sidebar-nav-item" onClick={onClose}>
            <RiSettings3Line className="text-lg" />
            Configurações
          </NavLink>
          <button onClick={handleLogout} className="sidebar-nav-item" style={{ color: 'var(--color-accent-rose)' }}>
            <RiLogoutBoxLine className="text-lg" />
            Sair
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

