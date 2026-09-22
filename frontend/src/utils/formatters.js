/**
 * Utilitários de formatação financeira
 */

const CURRENCY_SYMBOLS = { BRL: 'R$', USD: '$', EUR: '€' };
const CURRENCY_LOCALES = { BRL: 'pt-BR', USD: 'en-US', EUR: 'de-DE' };

/**
 * Formata valor monetário
 * @param {number} value
 * @param {string} currency
 */
export const formatCurrency = (value, currency = 'BRL') => {
  const num = parseFloat(value) || 0;
  return new Intl.NumberFormat(CURRENCY_LOCALES[currency] || 'pt-BR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(num);
};

/**
 * Formata valor como BRL compacto (ex: R$ 10,5 mil)
 */
export const formatCompact = (value) => {
  const num = parseFloat(value) || 0;
  if (Math.abs(num) >= 1_000_000) return `R$ ${(num / 1_000_000).toFixed(1)}M`;
  if (Math.abs(num) >= 1_000) return `R$ ${(num / 1_000).toFixed(1)}mil`;
  return formatCurrency(num);
};

/**
 * Retorna nome do mês em português
 */
export const monthName = (month, year) => {
  return new Date(year, month - 1).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });
};

/**
 * Mapeia tipo de receita para label
 */
export const incomeTypeLabel = (type) => ({
  salary: 'Salário',
  extra: 'Extra',
  other: 'Outro',
}[type] || type);

/**
 * Mapeia tipo de investimento para label
 */
export const investmentTypeLabel = (type) => ({
  stocks: 'Ações',
  crypto: 'Criptomoedas',
  fixed_income: 'Renda Fixa',
  savings: 'Poupança',
  real_estate: 'Imóveis',
  other: 'Outros',
}[type] || type);

/**
 * Classname para valor positivo/negativo
 */
export const amountClass = (value) =>
  parseFloat(value) >= 0 ? 'amount-positive' : 'amount-negative';
