const express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { Attachment, Expense } = require('../models');
const { requireAuth } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads');

const upload = multer({ dest: UPLOAD_DIR });

router.use(requireAuth);

router.post('/', upload.single('receipt'), async (req, res) => {
  const expense = await Expense.findByPk(req.params.expenseId);
  if (!expense) return res.status(404).render('error', { message: 'Not found', user: req.user });

  const attachment = await Attachment.create({
    expenseId: expense.id,
    originalFilename: req.file.originalname,
    storedFilename: req.file.filename,
    mimeType: req.file.mimetype,
  });

  res.redirect(`/expenses/${expense.id}`);
});

router.get('/:attachmentId', async (req, res) => {
  const attachment = await Attachment.findByPk(req.params.attachmentId);
  if (!attachment) return res.status(404).render('error', { message: 'Not found', user: req.user });
  res.sendFile(path.join(UPLOAD_DIR, attachment.storedFilename));
});

module.exports = router;
