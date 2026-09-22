const { Investment } = require('../models');

const calcAmountBRL = (amount, currency, exchange_rate) => {
  if (currency === 'BRL') return parseFloat(amount);
  return parseFloat((amount * exchange_rate).toFixed(2));
};

const list = async (req, res) => {
  try {
    const { month, year, type } = req.query;
    const where = { user_id: req.user.id };
    if (month) where.month = parseInt(month);
    if (year) where.year = parseInt(year);
    if (type) where.type = type;

    const investments = await Investment.findAll({
      where,
      order: [['created_at', 'DESC']],
    });

    const total_invested_brl = investments.reduce((sum, i) => sum + parseFloat(i.amount_brl), 0);
    const total_current_brl = investments.reduce((sum, i) =>
      sum + (i.current_value ? parseFloat(i.current_value) : parseFloat(i.amount_brl)), 0
    );
    const profit_loss = total_current_brl - total_invested_brl;
    const profit_loss_pct = total_invested_brl > 0
      ? ((profit_loss / total_invested_brl) * 100).toFixed(2)
      : '0.00';

    res.json({
      investments,
      summary: {
        total_invested_brl: total_invested_brl.toFixed(2),
        total_current_brl: total_current_brl.toFixed(2),
        profit_loss: profit_loss.toFixed(2),
        profit_loss_pct,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao listar investimentos.' });
  }
};

const create = async (req, res) => {
  try {
    const {
      name, type, ticker, amount_invested, current_value,
      currency = 'BRL', exchange_rate = 1.0, month, year, notes,
    } = req.body;

    const amount_brl = calcAmountBRL(amount_invested, currency, exchange_rate);

    const investment = await Investment.create({
      user_id: req.user.id,
      name, type, ticker, amount_invested, current_value,
      currency, exchange_rate, amount_brl, month, year, notes,
    });

    res.status(201).json({ message: 'Investimento criado.', investment });
  } catch (err) {
    console.error('Create investment error:', err.message);
    res.status(500).json({ error: 'Erro ao criar investimento.' });
  }
};

const getOne = async (req, res) => {
  try {
    const investment = await Investment.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });
    if (!investment) return res.status(404).json({ error: 'Investimento não encontrado.' });
    res.json({ investment });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar investimento.' });
  }
};

const update = async (req, res) => {
  try {
    const investment = await Investment.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });
    if (!investment) return res.status(404).json({ error: 'Investimento não encontrado.' });

    const { name, type, ticker, amount_invested, current_value, currency, exchange_rate, notes } = req.body;
    const newAmount = amount_invested || investment.amount_invested;
    const newCurrency = currency || investment.currency;
    const newExchangeRate = exchange_rate || investment.exchange_rate;

    await investment.update({
      name, type, ticker,
      amount_invested: newAmount,
      current_value,
      currency: newCurrency,
      exchange_rate: newExchangeRate,
      amount_brl: calcAmountBRL(newAmount, newCurrency, newExchangeRate),
      notes,
    });

    res.json({ message: 'Investimento atualizado.', investment });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar investimento.' });
  }
};

const remove = async (req, res) => {
  try {
    const investment = await Investment.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });
    if (!investment) return res.status(404).json({ error: 'Investimento não encontrado.' });
    await investment.destroy();
    res.json({ message: 'Investimento removido.' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao remover investimento.' });
  }
};

module.exports = { list, create, getOne, update, remove };
