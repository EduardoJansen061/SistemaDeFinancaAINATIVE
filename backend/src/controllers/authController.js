const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, ExpenseCategory } = require('../models');

// Default expense categories for new users
const DEFAULT_CATEGORIES = [
  { name: 'Moradia', color: '#6366f1', icon: 'home' },
  { name: 'Alimentação', color: '#f59e0b', icon: 'utensils' },
  { name: 'Transporte', color: '#10b981', icon: 'car' },
  { name: 'Saúde', color: '#ef4444', icon: 'heart' },
  { name: 'Educação', color: '#3b82f6', icon: 'book' },
  { name: 'Lazer', color: '#8b5cf6', icon: 'game' },
  { name: 'Vestuário', color: '#ec4899', icon: 'shirt' },
  { name: 'Serviços', color: '#14b8a6', icon: 'tools' },
  { name: 'Dívidas', color: '#f97316', icon: 'credit-card' },
  { name: 'Outros', color: '#6b7280', icon: 'more' },
];

/**
 * POST /api/auth/register
 */
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if email already exists
    const existing = await User.findOne({ where: { email: email.toLowerCase() } });
    if (existing) {
      return res.status(409).json({ error: 'E-mail já cadastrado.' });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 12);

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password_hash,
    });

    // Create default categories
    await ExpenseCategory.bulkCreate(
      DEFAULT_CATEGORIES.map(cat => ({ ...cat, user_id: user.id }))
    );

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return res.status(201).json({
      message: 'Usuário criado com sucesso.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        currency: user.currency,
      },
    });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ error: 'Erro ao criar usuário.' });
  }
};

/**
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      // Use same message to avoid user enumeration
      return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return res.json({
      message: 'Login realizado com sucesso.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        currency: user.currency,
      },
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Erro ao realizar login.' });
  }
};

/**
 * GET /api/auth/me
 */
const me = async (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      currency: req.user.currency,
    },
  });
};

/**
 * PUT /api/auth/profile
 */
const updateProfile = async (req, res) => {
  try {
    const { name, currency } = req.body;
    await req.user.update({ name, currency });
    res.json({ message: 'Perfil atualizado.', user: req.user });
  } catch (err) {
    console.error('Profile update error:', err.message);
    res.status(500).json({ error: 'Erro ao atualizar perfil.' });
  }
};

module.exports = { register, login, me, updateProfile };
