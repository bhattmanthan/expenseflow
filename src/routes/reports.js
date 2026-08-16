const express = require('express');
const { sequelize } = require('../models');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);
router.use(requireRole('finance_admin'));

router.get('/', (req, res) => {
  res.render('reports/index', { user: req.user, deptResults: null, empResults: null, filters: {} });
});

// Department Spend Report - aggregate spend per department for a date range
router.post('/department', async (req, res) => {
  const { dateFrom, dateTo, search } = req.body;

  let query = `
    SELECT u.department AS department,
           COUNT(e.id) AS claim_count,
           SUM(e.amount) AS total_spend
    FROM expenses e
    JOIN users u ON u.id = e.user_id
    WHERE e.date BETWEEN '${dateFrom}' AND '${dateTo}'
  `;
  if (search) {
    query += ` AND e.description ILIKE '%${search}%'`;
  }
  query += ' GROUP BY u.department ORDER BY total_spend DESC';

  const [deptResults] = await sequelize.query(query);
  res.render('reports/index', { user: req.user, deptResults, empResults: null, filters: req.body });
});

// Employee History Report - all claims + free text search across description and notes
router.post('/employee', async (req, res) => {
  const { dateFrom, dateTo, search } = req.body;

  let query = `
    SELECT u.name AS employee_name, u.department, u.notes,
           e.date, e.category, e.amount, e.status, e.description
    FROM expenses e
    JOIN users u ON u.id = e.user_id
    WHERE e.date BETWEEN '${dateFrom}' AND '${dateTo}'
  `;
  if (search) {
    query += ` AND (e.description ILIKE '%${search}%' OR u.notes ILIKE '%${search}%')`;
  }
  query += ' ORDER BY e.date DESC';

  const [empResults] = await sequelize.query(query);
  res.render('reports/index', { user: req.user, deptResults: null, empResults, filters: req.body });
});

module.exports = router;
