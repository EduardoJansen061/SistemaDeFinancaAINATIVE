const { Expense, ExpenseCategory } = require('../models');
const { v4: uuidv4 } = require('uuid');

const calcAmountBRL = (amount, currency, exchange_rate) => {
  if (currency === 'BRL') return parseFloat(amount);
  return parseFloat((amount * exchange_rate).toFixed(2));
};

/**
 * GET /api/expenses?month=&year=&paid=&category_id=
 */
const list = async (req, res) => {
  try {
    const { month, year, paid, category_id } = req.query;
    const where = { user_id: req.user.id };
    if (month) where.month = parseInt(month);
    if (year) where.year = parseInt(year);
    if (paid !== undefined) where.paid = paid === 'true';
    if (category_id) where.category_id = category_id;

    const expenses = await Expense.findAll({
      where,
      include: [{ model: ExpenseCategory, as: 'category', attributes: ['id', 'name', 'color', 'icon'] }],
      order: [['due_day', 'ASC'], ['created_at', 'DESC']],
    });

    const total_brl = expenses.reduce((sum, e) => sum + parseFloat(e.amount_brl), 0);
    const total_paid_brl = expenses.filter(e => e.paid).reduce((sum, e) => sum + parseFloat(e.amount_brl), 0);
    const total_pending_brl = total_brl - total_paid_brl;

    res.json({
      expenses,
      summary: {
        total_brl: total_brl.toFixed(2),
        total_paid_brl: total_paid_brl.toFixed(2),
        total_pending_brl: total_pending_brl.toFixed(2),
      },
    });
  } catch (err) {
    console.error('List expenses error:', err.message);
    res.status(500).json({ error: 'Erro ao listar despesas.' });
  }
};

/**
 * POST /api/expenses
 * Suporta parcelamento: se is_installment=true, cria N despesas
 */
const create = async (req, res) => {
  try {
    const {
      category_id, description, amount, currency = 'BRL',
      exchange_rate = 1.0, due_day, month, year,
      is_recurring = false, is_installment = false,
      total_installments, notes,
    } = req.body;

    const amount_brl = calcAmountBRL(amount, currency, exchange_rate);

    // === Parcelamento ===
    if (is_installment && total_installments > 1) {
      const installment_group_id = uuidv4();
      const expenses = [];

      for (let i = 0; i < total_installments; i++) {
        // Calculate month and year for each installment
        const installmentDate = new Date(year, month - 1 + i);
        const installmentMonth = installmentDate.getMonth() + 1;
        const installmentYear = installmentDate.getFullYear();

        expenses.push({
          user_id: req.user.id,
          category_id,
          description: `${description} (${i + 1}/${total_installments})`,
          amount,
          currency,
          exchange_rate,
          amount_brl,
          due_day,
          month: installmentMonth,
          year: installmentYear,
          is_recurring: false,
          is_installment: true,
          installment_group_id,
          total_installments,
          current_installment: i + 1,
          notes,
        });
      }

      const created = await Expense.bulkCreate(expenses, { returning: true });
      return res.status(201).json({
        message: `${total_installments} parcelas criadas.`,
        installment_group_id,
        count: created.length,
        first: created[0],
      });
    }

    // === Despesa simples ===
    const expense = await Expense.create({
      user_id: req.user.id,
      category_id,
      description,
      amount,
      currency,
      exchange_rate,
      amount_brl,
      due_day,
      month,
      year,
      is_recurring,
      is_installment: false,
      notes,
    });

    res.status(201).json({ message: 'Despesa criada.', expense });
  } catch (err) {
    console.error('Create expense error:', err.message);
    res.status(500).json({ error: 'Erro ao criar despesa.' });
  }
};

/**
 * GET /api/expenses/:id
 */
const getOne = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      where: { id: req.params.id, user_id: req.user.id },
      include: [{ model: ExpenseCategory, as: 'category' }],
    });
    if (!expense) return res.status(404).json({ error: 'Despesa não encontrada.' });
    res.json({ expense });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar despesa.' });
  }
};

/**
 * PUT /api/expenses/:id
 */
const update = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });
    if (!expense) return res.status(404).json({ error: 'Despesa não encontrada.' });

    const { category_id, description, amount, currency, exchange_rate, due_day, notes } = req.body;
    const newAmount = amount || expense.amount;
    const newCurrency = currency || expense.currency;
    const newExchangeRate = exchange_rate || expense.exchange_rate;

    await expense.update({
      category_id,
      description,
      amount: newAmount,
      currency: newCurrency,
      exchange_rate: newExchangeRate,
      amount_brl: calcAmountBRL(newAmount, newCurrency, newExchangeRate),
      due_day,
      notes,
    });

    res.json({ message: 'Despesa atualizada.', expense });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar despesa.' });
  }
};

/**
 * DELETE /api/expenses/:id
 */
const remove = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });
    if (!expense) return res.status(404).json({ error: 'Despesa não encontrada.' });
    await expense.destroy();
    res.json({ message: 'Despesa removida.' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao remover despesa.' });
  }
};

/**
 * PATCH /api/expenses/:id/pay
 * Marca uma despesa como paga
 */
const markPaid = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });
    if (!expense) return res.status(404).json({ error: 'Despesa não encontrada.' });

    await expense.update({ paid: true, paid_at: new Date() });
    res.json({ message: 'Despesa marcada como paga.', expense });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar despesa.' });
  }
};

/**
 * GET /api/expenses/upcoming
 * Despesas vencendo nos próximos 7 dias
 */
const upcoming = async (req, res) => {
  try {
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    const expenses = await Expense.findAll({
      where: {
        user_id: req.user.id,
        paid: false,
        month: currentMonth,
        year: currentYear,
      },
      include: [{ model: ExpenseCategory, as: 'category' }],
      order: [['due_day', 'ASC']],
    });

    // Filter expenses due within 7 days
    const upcoming = expenses.filter(e => {
      if (!e.due_day) return false;
      const daysUntilDue = e.due_day - currentDay;
      return daysUntilDue >= 0 && daysUntilDue <= 7;
    });

    const overdue = expenses.filter(e => {
      if (!e.due_day) return false;
      return e.due_day < currentDay;
    });

    res.json({ upcoming, overdue });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar despesas próximas.' });
  }
};

module.exports = { list, create, getOne, update, remove, markPaid, upcoming };
