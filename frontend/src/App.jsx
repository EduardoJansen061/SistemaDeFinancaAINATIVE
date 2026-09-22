import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import IncomesPage from './pages/IncomesPage';
import ExpensesPage from './pages/ExpensesPage';
import InvestmentsPage from './pages/InvestmentsPage';
import ReportsPage from './pages/ReportsPage';

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#0f1120',
              color: '#f1f5f9',
              border: '1px solid rgba(99,102,241,0.2)',
              borderRadius: '12px',
              fontSize: '0.875rem',
              fontFamily: 'Inter, sans-serif',
            },
            success: {
              iconTheme: { primary: '#10b981', secondary: '#0f1120' },
            },
            error: {
              iconTheme: { primary: '#f43f5e', secondary: '#0f1120' },
            },
          }}
        />

        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="receitas" element={<IncomesPage />} />
            <Route path="despesas" element={<ExpensesPage />} />
            <Route path="investimentos" element={<InvestmentsPage />} />
            <Route path="relatorios" element={<ReportsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
