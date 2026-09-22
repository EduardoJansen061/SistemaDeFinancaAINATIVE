const User = require('./User');
const Income = require('./Income');
const Expense = require('./Expense');
const ExpenseCategory = require('./ExpenseCategory');
const Investment = require('./Investment');
const MonthlySummary = require('./MonthlySummary');
const WebhookLog = require('./WebhookLog');

// === Associations ===

// User → Incomes
User.hasMany(Income, { foreignKey: 'user_id', as: 'incomes', onDelete: 'CASCADE' });
Income.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User → ExpenseCategories
User.hasMany(ExpenseCategory, { foreignKey: 'user_id', as: 'categories', onDelete: 'CASCADE' });
ExpenseCategory.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User → Expenses
User.hasMany(Expense, { foreignKey: 'user_id', as: 'expenses', onDelete: 'CASCADE' });
Expense.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// ExpenseCategory → Expenses
ExpenseCategory.hasMany(Expense, { foreignKey: 'category_id', as: 'expenses' });
Expense.belongsTo(ExpenseCategory, { foreignKey: 'category_id', as: 'category' });

// User → Investments
User.hasMany(Investment, { foreignKey: 'user_id', as: 'investments', onDelete: 'CASCADE' });
Investment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User → MonthlySummaries
User.hasMany(MonthlySummary, { foreignKey: 'user_id', as: 'summaries', onDelete: 'CASCADE' });
MonthlySummary.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User → WebhookLogs
User.hasMany(WebhookLog, { foreignKey: 'user_id', as: 'webhookLogs', onDelete: 'CASCADE' });
WebhookLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = {
  User,
  Income,
  Expense,
  ExpenseCategory,
  Investment,
  MonthlySummary,
  WebhookLog,
};
