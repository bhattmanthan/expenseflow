const express = require('express');
const multer = require('multer');
const path = require('path');
const { Attachment, Expense } = require('../models');
const { requireAuth } = require('../middleware/auth');
const { convertReceipt } = require('../utils/receiptConverter');
const logger = require('../utils/logger');

const router = express.Router({ mergeParams: true });

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads');

// keep the original filename on disk so archived receipts stay human-readable
const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: (req, file, cb) => cb(null, file.originalname),
});
const upload = multer({ storage });

router.use(requireAuth);

router.post('/', upload.single('receipt'), async (req, res) => {
  const expense = await Expense.findByPk(req.params.expenseId);
  if (!expense) return res.status(404).render('error', { message: 'Not found', user: req.user });

  let storedFilename = req.file.filename;
  try {
    const archivedPath = await convertReceipt(UPLOAD_DIR, req.file.originalname, expense.date);
    storedFilename = path.basename(archivedPath);
  } catch (err) {
    logger.warn('receipt conversion failed, keeping original upload', { error: err.message });
  }

  const attachment = await Attachment.create({
    expenseId: expense.id,
    originalFilename: req.file.originalname,
    storedFilename,
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
