import { useState, useCallback } from 'react';

/**
 * Generic hook for data fetching with loading/error states
 */
export const useApi = (serviceFn) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const res = await serviceFn(...args);
      setData(res.data);
      return { success: true, data: res.data };
    } catch (err) {
      const msg = err.response?.data?.error || 'Erro inesperado.';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, [serviceFn]);

  return { data, loading, error, execute, setData };
};

/**
 * Hook for current month/year navigation
 */
export const useMonthNav = () => {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const prev = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };

  const next = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const label = new Date(year, month - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return { month, year, prev, next, label };
};
