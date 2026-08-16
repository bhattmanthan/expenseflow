const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('./utils/logger');
const { loadUser } = require('./middleware/auth');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
});

app.use(loadUser);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/', (req, res) => {
  res.render('index', { user: req.user || null });
});

app.use('/auth', require('./routes/auth'));
app.use('/expenses', require('./routes/expenses'));
app.use('/expenses/:expenseId/attachments', require('./routes/attachments'));
app.use('/expenses/:expenseId/comments', require('./routes/comments'));
app.use('/approvals', require('./routes/approvals'));
app.use('/profile', require('./routes/profile'));

module.exports = app;
