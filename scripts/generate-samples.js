import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateSamplePDFs() {
  const samplesDir = path.join(__dirname, '..', 'public', 'samples');
  if (!fs.existsSync(samplesDir)) {
    fs.mkdirSync(samplesDir, { recursive: true });
  }

  // 1. Generate Sample Agreement / Contract
  const contractDoc = await PDFDocument.create();
  const fontBold = await contractDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await contractDoc.embedFont(StandardFonts.Helvetica);

  // Page 1
  const page1 = contractDoc.addPage([595, 842]);
  page1.drawText('MASTER SERVICES AGREEMENT', {
    x: 50,
    y: 780,
    size: 20,
    font: fontBold,
    color: rgb(0.1, 0.15, 0.25),
  });

  page1.drawText('Document ID: MSA-2026-0905 | Status: Executable Draft', {
    x: 50,
    y: 755,
    size: 10,
    font: fontRegular,
    color: rgb(0.4, 0.45, 0.55),
  });

  const bodyText1 = `This Master Services Agreement ("Agreement") is entered into as of September 5, 2026,
by and between Ergon Technologies Inc. ("Client") and Acme Solutions LLC ("Provider").

1. SCOPE OF SERVICES
Provider agrees to deliver engineering services, architectural audits, and document workflows
in accordance with individual Statements of Work executed by authorized parties.

2. PAYMENT TERMS
Client agrees to remit invoice payments within net thirty (30) days of verified receipt.
Total project milestone fees shall not exceed $45,000 USD without prior written amendment.

3. CONFIDENTIALITY & PRIVACY
Each party agrees to maintain in strict confidence all proprietary document structures,
cryptographic tokens, and user materials. All document manipulation shall be conducted
under zero-trust, local-first computing guidelines.`;

  page1.drawText(bodyText1, {
    x: 50,
    y: 710,
    size: 11,
    font: fontRegular,
    color: rgb(0.2, 0.2, 0.25),
    lineHeight: 18,
  });

  // Page 2
  const page2 = contractDoc.addPage([595, 842]);
  page2.drawText('MASTER SERVICES AGREEMENT (CONT.)', {
    x: 50,
    y: 780,
    size: 16,
    font: fontBold,
    color: rgb(0.1, 0.15, 0.25),
  });

  const bodyText2 = `4. TERM AND TERMINATION
Either party may terminate this agreement upon thirty (30) business days written notice.
Upon termination, all active sessions and temporary documents must be cleanly sanitized.

5. SIGNATURE & AUTHORIZATION
IN WITNESS WHEREOF, the authorized representatives have executed this document.


Client Signature: _______________________      Date: _______________

Provider Signature: _____________________      Date: _______________`;

  page2.drawText(bodyText2, {
    x: 50,
    y: 730,
    size: 11,
    font: fontRegular,
    color: rgb(0.2, 0.2, 0.25),
    lineHeight: 20,
  });

  const contractBytes = await contractDoc.save();
  fs.writeFileSync(path.join(samplesDir, 'sample_contract.pdf'), contractBytes);

  // 2. Generate Sample Report
  const reportDoc = await PDFDocument.create();
  const rPage1 = reportDoc.addPage([595, 842]);
  rPage1.drawText('ANNUAL TECHNOLOGY REPORT 2026', {
    x: 50,
    y: 780,
    size: 22,
    font: fontBold,
    color: rgb(0.2, 0.3, 0.7),
  });
  rPage1.drawText('Executive Summary: Transitioning to Zero-Server Local-First Document Architecture.', {
    x: 50,
    y: 750,
    size: 11,
    font: fontRegular,
    color: rgb(0.3, 0.3, 0.35),
  });

  const reportBytes = await reportDoc.save();
  fs.writeFileSync(path.join(samplesDir, 'sample_report.pdf'), reportBytes);

  console.log('Sample PDFs generated in public/samples/');
}

generateSamplePDFs();
