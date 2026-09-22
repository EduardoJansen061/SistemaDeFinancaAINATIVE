const { Income, sequelize } = require('../models');
const { Op } = require('sequelize');

/**
 * Calcula amount_brl baseado na moeda e taxa de câmbio
 */
const calcAmountBRL = (amount, currency, exchange_rate) => {
  if (currency === 'BRL') return parseFloat(amount);
  return parseFloat((amount * exchange_rate).toFixed(2));
};

/**
 * GET /api/incomes?month=&year=
 */
const list = async (req, res) => {
  try {
    const { month, year } = req.query;
    const where = { user_id: req.user.id };
    if (month) where.month = parseInt(month);
    if (year) where.year = parseInt(year);

    const incomes = await Income.findAll({
      where,
      order: [['created_at', 'DESC']],
    });

    const total_brl = incomes.reduce((sum, i) => sum + parseFloat(i.amount_brl), 0);

    res.json({ incomes, total_brl: total_brl.toFixed(2) });
  } catch (err) {
    console.error('List incomes error:', err.message);
    res.status(500).json({ error: 'Erro ao listar receitas.' });
  }
};

/**
 * POST /api/incomes
 */
const create = async (req, res) => {
  try {
    const {
      type, description, amount, currency = 'BRL',
      exchange_rate = 1.0, month, year, is_recurring = false,
      received = false, received_at, notes,
    } = req.body;

    const amount_brl = calcAmountBRL(amount, currency, exchange_rate);

    const income = await Income.create({
      user_id: req.user.id,
      type, description, amount, currency, exchange_rate, amount_brl,
      month, year, is_recurring, received, received_at, notes,
    });

    res.status(201).json({ message: 'Receita criada.', income });
  } catch (err) {
    console.error('Create income error:', err.message);
    res.status(500).json({ error: 'Erro ao criar receita.' });
  }
};

/**
 * GET /api/incomes/:id
 */
const getOne = async (req, res) => {
  try {
    const income = await Income.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });
    if (!income) return res.status(404).json({ error: 'Receita não encontrada.' });
    res.json({ income });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar receita.' });
  }
};

/**
 * PUT /api/incomes/:id
 */
const update = async (req, res) => {
  try {
    const income = await Income.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });
    if (!income) return res.status(404).json({ error: 'Receita não encontrada.' });

    const {
      type, description, amount, currency, exchange_rate,
      month, year, is_recurring, received, received_at, notes,
    } = req.body;

    const newCurrency = currency || income.currency;
    const newExchangeRate = exchange_rate || income.exchange_rate;
    const newAmount = amount || income.amount;
    const newAmountBRL = calcAmountBRL(newAmount, newCurrency, newExchangeRate);

    await income.update({
      type, description,
      amount: newAmount,
      currency: newCurrency,
      exchange_rate: newExchangeRate,
      amount_brl: newAmountBRL,
      month, year, is_recurring, received, received_at, notes,
    });

    res.json({ message: 'Receita atualizada.', income });
  } catch (err) {
    console.error('Update income error:', err.message);
    res.status(500).json({ error: 'Erro ao atualizar receita.' });
  }
};

/**
 * DELETE /api/incomes/:id
 */
const remove = async (req, res) => {
  try {
    const income = await Income.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });
    if (!income) return res.status(404).json({ error: 'Receita não encontrada.' });

    await income.destroy();
    res.json({ message: 'Receita removida.' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao remover receita.' });
  }
};

/**
 * PATCH /api/incomes/:id/receive
 * Marca receita como recebida
 */
const markReceived = async (req, res) => {
  try {
    const income = await Income.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });
    if (!income) return res.status(404).json({ error: 'Receita não encontrada.' });

    await income.update({ received: true, received_at: new Date() });
    res.json({ message: 'Receita marcada como recebida.', income });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar receita.' });
  }
};

module.exports = { list, create, getOne, update, remove, markReceived };
