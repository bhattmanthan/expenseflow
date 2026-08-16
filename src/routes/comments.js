const express = require('express');
const { Comment, Expense } = require('../models');
const { requireAuth } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

router.use(requireAuth);

router.post('/', async (req, res) => {
  const expense = await Expense.findByPk(req.params.expenseId);
  if (!expense) return res.status(404).render('error', { message: 'Not found', user: req.user });

  await Comment.create({
    expenseId: expense.id,
    authorId: req.user.id,
    body: req.body.body,
  });

  res.redirect(`/expenses/${expense.id}`);
});

router.post('/:commentId/delete', async (req, res) => {
  const comment = await Comment.findByPk(req.params.commentId);
  if (!comment) return res.status(404).render('error', { message: 'Not found', user: req.user });
  if (comment.authorId !== req.user.id) {
    return res.status(403).render('error', { message: 'Forbidden', user: req.user });
  }
  await comment.destroy();
  res.redirect(`/expenses/${req.params.expenseId}`);
});

module.exports = router;
