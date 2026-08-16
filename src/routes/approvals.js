const express = require('express');
const { Op } = require('sequelize');
const { Expense, User, ApprovalLog } = require('../models');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

const HIGH_VALUE_THRESHOLD = 1000;

router.use(requireAuth);
router.use(requireRole('manager', 'finance_admin'));

router.get('/', async (req, res) => {
  let expenses;
  if (req.user.role === 'finance_admin') {
    expenses = await Expense.findAll({
      where: { status: 'pending', amount: { [Op.gte]: HIGH_VALUE_THRESHOLD } },
      include: [{ model: User, as: 'employee' }],
      order: [['createdAt', 'ASC']],
    });
  } else {
    const reports = await User.findAll({ where: { managerId: req.user.id }, attributes: ['id'] });
    const reportIds = reports.map((r) => r.id);
    expenses = await Expense.findAll({
      where: { status: 'pending', userId: reportIds, amount: { [Op.lt]: HIGH_VALUE_THRESHOLD } },
      include: [{ model: User, as: 'employee' }],
      order: [['createdAt', 'ASC']],
    });
  }
  res.render('approvals/index', { user: req.user, expenses });
});

router.post('/:id/approve', async (req, res) => {
  await decide(req, res, 'approved');
});

router.post('/:id/reject', async (req, res) => {
  await decide(req, res, 'rejected');
});

async function decide(req, res, newStatus) {
  const expense = await Expense.findByPk(req.params.id);
  if (!expense) return res.status(404).render('error', { message: 'Not found', user: req.user });

  const isHighValue = expense.amount >= HIGH_VALUE_THRESHOLD;
  if (isHighValue && req.user.role !== 'finance_admin') {
    return res.status(403).render('error', { message: 'Only Finance Admin can decide on this claim', user: req.user });
  }

  const previousStatus = expense.status;
  await expense.update({ status: newStatus });
  await ApprovalLog.create({
    expenseId: expense.id,
    actorId: req.user.id,
    previousStatus,
    newStatus: newStatus,
    comment: req.body.comment || null,
  });

  res.redirect('/approvals');
}

module.exports = router;
