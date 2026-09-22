const { ExpenseCategory } = require('../models');

const list = async (req, res) => {
  try {
    const categories = await ExpenseCategory.findAll({
      where: { user_id: req.user.id },
      order: [['name', 'ASC']],
    });
    res.json({ categories });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao listar categorias.' });
  }
};

const create = async (req, res) => {
  try {
    const { name, color, icon } = req.body;
    const category = await ExpenseCategory.create({
      user_id: req.user.id, name, color, icon,
    });
    res.status(201).json({ message: 'Categoria criada.', category });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar categoria.' });
  }
};

const update = async (req, res) => {
  try {
    const category = await ExpenseCategory.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });
    if (!category) return res.status(404).json({ error: 'Categoria não encontrada.' });
    await category.update(req.body);
    res.json({ message: 'Categoria atualizada.', category });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar categoria.' });
  }
};

const remove = async (req, res) => {
  try {
    const category = await ExpenseCategory.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });
    if (!category) return res.status(404).json({ error: 'Categoria não encontrada.' });
    await category.destroy();
    res.json({ message: 'Categoria removida.' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao remover categoria.' });
  }
};

module.exports = { list, create, update, remove };
