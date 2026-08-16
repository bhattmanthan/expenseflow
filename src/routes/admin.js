const express = require('express');
const { User } = require('../models');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);
router.use(requireRole('finance_admin'));

router.get('/users', async (req, res) => {
  const users = await User.findAll({ order: [['name', 'ASC']] });
  res.render('admin/users', { user: req.user, users });
});

router.get('/users/:id/edit', async (req, res) => {
  const editUser = await User.findByPk(req.params.id);
  if (!editUser) return res.status(404).render('error', { message: 'Not found', user: req.user });
  res.render('admin/edit-user', { user: req.user, editUser });
});

router.post('/users/:id', async (req, res) => {
  const editUser = await User.findByPk(req.params.id);
  if (!editUser) return res.status(404).render('error', { message: 'Not found', user: req.user });
  const { name, department, role, managerId } = req.body;
  await editUser.update({ name, department, role, managerId: managerId || null });
  res.redirect('/admin/users');
});

router.post('/users/:id/deactivate', async (req, res) => {
  const editUser = await User.findByPk(req.params.id);
  if (!editUser) return res.status(404).render('error', { message: 'Not found', user: req.user });
  await editUser.update({ isActive: false });
  res.redirect('/admin/users');
});

router.post('/users/:id/activate', async (req, res) => {
  const editUser = await User.findByPk(req.params.id);
  if (!editUser) return res.status(404).render('error', { message: 'Not found', user: req.user });
  await editUser.update({ isActive: true });
  res.redirect('/admin/users');
});

module.exports = router;
