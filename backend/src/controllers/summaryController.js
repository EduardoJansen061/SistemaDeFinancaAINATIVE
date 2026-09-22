const { Income, Expense, Investment, MonthlySummary } = require('../models');

/**
 * Recalcula e persiste o resumo mensal no banco
 */
const recalculate = async (user_id, month, year) => {
  const [incomes, expenses, investments] = await Promise.all([
    Income.findAll({ where: { user_id, month, year } }),
    Expense.findAll({ where: { user_id, month, year } }),
    Investment.findAll({ where: { user_id, month, year } }),
  ]);

  const total_income_brl = incomes.reduce((s, i) => s + parseFloat(i.amount_brl), 0);
  const total_expenses_brl = expenses.reduce((s, e) => s + parseFloat(e.amount_brl), 0);
  const total_investments_brl = investments.reduce((s, i) => s + parseFloat(i.amount_brl), 0);
  const balance_brl = total_income_brl - total_expenses_brl - total_investments_brl;

  const [summary] = await MonthlySummary.upsert({
    user_id,
    month,
    year,
    total_income_brl: total_income_brl.toFixed(2),
    total_expenses_brl: total_expenses_brl.toFixed(2),
    total_investments_brl: total_investments_brl.toFixed(2),
    balance_brl: balance_brl.toFixed(2),
  });

  return summary;
};

/**
 * GET /api/summary/:year/:month
 */
const getSummary = async (req, res) => {
  try {
    const month = parseInt(req.params.month);
    const year = parseInt(req.params.year);

    if (month < 1 || month > 12) {
      return res.status(400).json({ error: 'Mês inválido (1-12).' });
    }

    const summary = await recalculate(req.user.id, month, year);

    // Get last 6 months for trend chart
    const history = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(year, month - 1 - i);
      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      const hist = await MonthlySummary.findOne({
        where: { user_id: req.user.id, month: m, year: y },
      });
      history.push({
        month: m,
        year: y,
        label: `${String(m).padStart(2, '0')}/${y}`,
        total_income_brl: hist ? parseFloat(hist.total_income_brl) : 0,
        total_expenses_brl: hist ? parseFloat(hist.total_expenses_brl) : 0,
        total_investments_brl: hist ? parseFloat(hist.total_investments_brl) : 0,
        balance_brl: hist ? parseFloat(hist.balance_brl) : 0,
      });
    }

    res.json({ summary, history });
  } catch (err) {
    console.error('Summary error:', err.message);
    res.status(500).json({ error: 'Erro ao calcular resumo.' });
  }
};

module.exports = { getSummary, recalculate };
