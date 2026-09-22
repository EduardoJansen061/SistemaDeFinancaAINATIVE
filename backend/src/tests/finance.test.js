/**
 * TASK 3, 4, 5 — Testes de Regras de Negócio
 * Receitas, Despesas (parcelamento), Investimentos, Summary
 */

process.env.NODE_ENV = 'test';
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_NAME = 'financaspro_test';
process.env.DB_USER = process.env.DB_USER || 'root';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || '';
process.env.JWT_SECRET = 'test_secret_key_32_chars_minimum!!';
process.env.JWT_EXPIRES_IN = '1h';

const request = require('supertest');
const app = require('../server');

let token;
const NOW = new Date();
const MONTH = NOW.getMonth() + 1;
const YEAR = NOW.getFullYear();

beforeAll(async () => {
  // Register and login test user
  const email = `finance_test_${Date.now()}@example.com`;
  const reg = await request(app).post('/api/auth/register').send({
    name: 'Finance Tester',
    email,
    password: 'Finance@123',
  });
  token = reg.body.token;
});

const auth = () => ({ Authorization: `Bearer ${token}` });

// ============================================
// INCOME TESTS
// ============================================
describe('Incomes — Task 3', () => {
  let incomeId;

  it('should create a BRL salary income', async () => {
    const res = await request(app)
      .post('/api/incomes')
      .set(auth())
      .send({ type: 'salary', description: 'Salário Empresa X', amount: 5000, month: MONTH, year: YEAR });

    expect(res.status).toBe(201);
    expect(parseFloat(res.body.income.amount_brl)).toBe(5000);
    incomeId = res.body.income.id;
  });

  it('should create a USD extra income with exchange rate', async () => {
    const res = await request(app)
      .post('/api/incomes')
      .set(auth())
      .send({
        type: 'extra',
        description: 'Freelance USD',
        amount: 100,
        currency: 'USD',
        exchange_rate: 5.5,
        month: MONTH,
        year: YEAR,
      });

    expect(res.status).toBe(201);
    expect(parseFloat(res.body.income.amount_brl)).toBeCloseTo(550, 1);
  });

  it('should list incomes for current month', async () => {
    const res = await request(app)
      .get(`/api/incomes?month=${MONTH}&year=${YEAR}`)
      .set(auth());

    expect(res.status).toBe(200);
    expect(res.body.incomes.length).toBeGreaterThanOrEqual(2);
    expect(parseFloat(res.body.total_brl)).toBeGreaterThan(0);
  });

  it('should mark income as received', async () => {
    const res = await request(app)
      .patch(`/api/incomes/${incomeId}/receive`)
      .set(auth());

    expect(res.status).toBe(200);
    expect(res.body.income.received).toBe(true);
  });

  it('should reject negative amount', async () => {
    const res = await request(app)
      .post('/api/incomes')
      .set(auth())
      .send({ type: 'salary', description: 'Test', amount: -100, month: MONTH, year: YEAR });
    expect(res.status).toBe(422);
  });

  it('should reject invalid month (13)', async () => {
    const res = await request(app)
      .post('/api/incomes')
      .set(auth())
      .send({ type: 'salary', description: 'Test', amount: 1000, month: 13, year: YEAR });
    expect(res.status).toBe(422);
  });

  it('should reject access to another user income', async () => {
    // Create second user
    const reg2 = await request(app).post('/api/auth/register').send({
      name: 'User 2',
      email: `user2_${Date.now()}@test.com`,
      password: 'User2@123',
    });
    const token2 = reg2.body.token;

    const res = await request(app)
      .get(`/api/incomes/${incomeId}`)
      .set({ Authorization: `Bearer ${token2}` });

    expect(res.status).toBe(404); // Should not expose other user's data
  });

  it('should delete income', async () => {
    const res = await request(app)
      .delete(`/api/incomes/${incomeId}`)
      .set(auth());
    expect(res.status).toBe(200);
  });
});

// ============================================
// EXPENSE TESTS
// ============================================
describe('Expenses & Installments — Task 4', () => {
  let expenseId;
  let installmentGroupId;

  it('should create a simple expense', async () => {
    const res = await request(app)
      .post('/api/expenses')
      .set(auth())
      .send({
        description: 'Aluguel',
        amount: 1500,
        due_day: 5,
        month: MONTH,
        year: YEAR,
        is_recurring: true,
      });

    expect(res.status).toBe(201);
    expenseId = res.body.expense.id;
  });

  it('should create installment expense (3x)', async () => {
    const res = await request(app)
      .post('/api/expenses')
      .set(auth())
      .send({
        description: 'Notebook',
        amount: 500,
        month: MONTH,
        year: YEAR,
        is_installment: true,
        total_installments: 3,
      });

    expect(res.status).toBe(201);
    expect(res.body.count).toBe(3);
    installmentGroupId = res.body.installment_group_id;

    // Check installment labels
    const firstDesc = res.body.first.description;
    expect(firstDesc).toContain('(1/3)');
  });

  it('should list expenses for current month with summary', async () => {
    const res = await request(app)
      .get(`/api/expenses?month=${MONTH}&year=${YEAR}`)
      .set(auth());

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('summary');
    expect(parseFloat(res.body.summary.total_brl)).toBeGreaterThan(0);
  });

  it('should get upcoming/overdue expenses', async () => {
    const res = await request(app)
      .get('/api/expenses/upcoming')
      .set(auth());

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('upcoming');
    expect(res.body).toHaveProperty('overdue');
  });

  it('should mark expense as paid', async () => {
    const res = await request(app)
      .patch(`/api/expenses/${expenseId}/pay`)
      .set(auth());

    expect(res.status).toBe(200);
    expect(res.body.expense.paid).toBe(true);
  });

  it('should reject installments < 2', async () => {
    const res = await request(app)
      .post('/api/expenses')
      .set(auth())
      .send({
        description: 'Test',
        amount: 100,
        month: MONTH,
        year: YEAR,
        is_installment: true,
        total_installments: 1,
      });
    expect(res.status).toBe(422);
  });

  it('should delete expense', async () => {
    const res = await request(app)
      .delete(`/api/expenses/${expenseId}`)
      .set(auth());
    expect(res.status).toBe(200);
  });
});

// ============================================
// INVESTMENT TESTS
// ============================================
describe('Investments — Task 5', () => {
  let investmentId;

  it('should create an investment', async () => {
    const res = await request(app)
      .post('/api/investments')
      .set(auth())
      .send({
        name: 'PETR4',
        type: 'stocks',
        ticker: 'PETR4',
        amount_invested: 1000,
        month: MONTH,
        year: YEAR,
      });

    expect(res.status).toBe(201);
    investmentId = res.body.investment.id;
  });

  it('should list investments with profit/loss summary', async () => {
    const res = await request(app)
      .get(`/api/investments?month=${MONTH}&year=${YEAR}`)
      .set(auth());

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('summary');
    expect(res.body.summary).toHaveProperty('profit_loss_pct');
  });

  it('should delete investment', async () => {
    const res = await request(app)
      .delete(`/api/investments/${investmentId}`)
      .set(auth());
    expect(res.status).toBe(200);
  });
});

// ============================================
// SUMMARY TESTS
// ============================================
describe('Monthly Summary — Task 5', () => {
  it('should return monthly summary with balance', async () => {
    // Add income
    await request(app).post('/api/incomes').set(auth()).send({
      type: 'salary', description: 'Summary Test Salary', amount: 3000, month: MONTH, year: YEAR,
    });
    // Add expense
    await request(app).post('/api/expenses').set(auth()).send({
      description: 'Summary Test Rent', amount: 1000, month: MONTH, year: YEAR,
    });

    const res = await request(app)
      .get(`/api/summary/${YEAR}/${MONTH}`)
      .set(auth());

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('summary');
    expect(res.body).toHaveProperty('history');
    expect(res.body.history).toHaveLength(6);

    const summary = res.body.summary;
    expect(parseFloat(summary.total_income_brl)).toBeGreaterThan(0);
    expect(parseFloat(summary.total_expenses_brl)).toBeGreaterThan(0);
    // balance = income - expenses - investments
    const expectedBalance = parseFloat(summary.total_income_brl)
      - parseFloat(summary.total_expenses_brl)
      - parseFloat(summary.total_investments_brl);
    expect(parseFloat(summary.balance_brl)).toBeCloseTo(expectedBalance, 1);
  });

  it('should reject invalid month', async () => {
    const res = await request(app)
      .get(`/api/summary/${YEAR}/13`)
      .set(auth());
    expect(res.status).toBe(400);
  });
});
