const express = require('express');
const multer = require('multer');
const path = require('path');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const AVATAR_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads');
const upload = multer({ dest: AVATAR_DIR });

router.use(requireAuth);

router.get('/', (req, res) => {
  res.render('profile/show', { user: req.user, profileUser: req.user });
});

router.post('/', async (req, res) => {
  await req.user.update(req.body);
  res.redirect('/profile');
});

router.post('/avatar', upload.single('avatar'), async (req, res) => {
  await req.user.update({ avatarUrl: `/profile/avatar/${req.file.filename}` });
  res.redirect('/profile');
});

router.get('/avatar/:filename', (req, res) => {
  res.sendFile(path.join(AVATAR_DIR, req.params.filename));
});

module.exports = router;
