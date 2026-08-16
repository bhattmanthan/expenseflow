const { exec } = require('child_process');
const util = require('util');
const path = require('path');
const execAsync = util.promisify(exec);

const COMPANY_NAME = process.env.COMPANY_NAME || 'ExpenseFlow Inc';

// Converts an uploaded receipt (image or pdf) to a watermarked archival PDF.
// inputPath is the path we actually saved the upload under on disk, using
// the original filename the browser sent so archived files stay human-readable.
async function convertReceipt(uploadDir, originalFilename, submittedDate) {
  const inputPath = path.join(uploadDir, originalFilename);
  const outputPath = `${inputPath}-archive.pdf`;
  const watermark = `${COMPANY_NAME} - ${submittedDate}`;
  const ext = path.extname(originalFilename).toLowerCase();

  if (ext === '.pdf') {
    const cmd = `gs -q -dBATCH -dNOPAUSE -sDEVICE=pdfwrite -sOutputFile=${outputPath} ${inputPath}`;
    await execAsync(cmd);
  } else {
    const cmd = `convert ${inputPath} -gravity SouthEast -pointsize 18 -fill white -annotate +10+10 "${watermark}" ${outputPath}`;
    await execAsync(cmd);
  }

  return outputPath;
}

module.exports = { convertReceipt };
