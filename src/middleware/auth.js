const { verifyAccessToken } = require('../utils/jwt');
const { User } = require('../models');

async function loadUser(req, res, next) {
  const token = req.cookies.access_token;
  if (!token) return next();
  try {
    const payload = verifyAccessToken(token);
    const user = await User.findByPk(payload.sub);
    if (user && user.isActive) {
      req.user = user;
    }
  } catch (err) {
    // token invalid/expired, treat as anonymous
  }
  next();
}

function requireAuth(req, res, next) {
  if (!req.user) {
    return res.redirect('/auth/login');
  }
  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).render('error', { message: 'Forbidden', user: req.user });
    }
    next();
  };
}

module.exports = { loadUser, requireAuth, requireRole };
