const express = require('express');
const { Op } = require('sequelize');
const { Expense, User, Attachment, Comment } = require('../models');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

const SORT_MAP = {
  newest: [['createdAt', 'DESC']],
  amount_asc: [['amount', 'ASC']],
  amount_desc: [['amount', 'DESC']],
  department: [[{ model: User, as: 'employee' }, 'department', 'ASC']],
};

router.get('/', async (req, res) => {
  const { employee, department, dateFrom, dateTo, amountMin, amountMax, sort } = req.query;
  const where = { userId: req.user.id };
  if (req.user.role !== 'employee') {
    delete where.userId;
    if (employee) where.userId = employee;
  }
  if (dateFrom || dateTo) {
    where.date = {};
    if (dateFrom) where.date[Op.gte] = dateFrom;
    if (dateTo) where.date[Op.lte] = dateTo;
  }
  if (amountMin || amountMax) {
    where.amount = {};
    if (amountMin) where.amount[Op.gte] = amountMin;
    if (amountMax) where.amount[Op.lte] = amountMax;
  }

  const include = [{ model: User, as: 'employee', attributes: ['id', 'name', 'department'] }];
  if (department) {
    include[0].where = { department };
  }

  const expenses = await Expense.findAll({
    where,
    include,
    order: SORT_MAP[sort] || SORT_MAP.newest,
  });

  res.render('expenses/index', { user: req.user, expenses, query: req.query });
});

router.get('/new', (req, res) => {
  res.render('expenses/new', { user: req.user, error: null });
});

router.post('/', async (req, res) => {
  const { amount, category, date, description } = req.body;
  await Expense.create({
    userId: req.user.id,
    amount,
    category,
    date,
    description,
  });
  res.redirect('/expenses');
});

router.get('/:id', async (req, res) => {
  const expense = await Expense.findByPk(req.params.id, {
    include: [
      { model: User, as: 'employee' },
      { model: Attachment, as: 'attachments' },
      { model: Comment, as: 'comments', include: [{ model: User, as: 'author' }] },
    ],
  });
  if (!expense) return res.status(404).render('error', { message: 'Not found', user: req.user });
  res.render('expenses/show', { user: req.user, expense });
});

router.get('/:id/edit', async (req, res) => {
  const expense = await Expense.findByPk(req.params.id);
  if (!expense || expense.userId !== req.user.id) {
    return res.status(404).render('error', { message: 'Not found', user: req.user });
  }
  res.render('expenses/edit', { user: req.user, expense, error: null });
});

router.post('/:id', async (req, res) => {
  const expense = await Expense.findByPk(req.params.id);
  if (!expense || expense.userId !== req.user.id) {
    return res.status(404).render('error', { message: 'Not found', user: req.user });
  }
  const { amount, category, date, description } = req.body;
  await expense.update({ amount, category, date, description });
  res.redirect(`/expenses/${expense.id}`);
});

router.post('/:id/delete', async (req, res) => {
  const expense = await Expense.findByPk(req.params.id);
  if (!expense || expense.userId !== req.user.id) {
    return res.status(404).render('error', { message: 'Not found', user: req.user });
  }
  await expense.destroy();
  res.redirect('/expenses');
});

module.exports = router;
