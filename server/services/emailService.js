const nodemailer = require('nodemailer');

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const ALERT_FROM_EMAIL = process.env.ALERT_FROM_EMAIL || 'no-reply@bida-dashboard.gov.bd';

const isSmtpConfigured = !!(SMTP_HOST && SMTP_USER && SMTP_PASS);

let transporter = null;

if (isSmtpConfigured) {
  console.log(`✉️  SMTP Configured. Host: ${SMTP_HOST}:${SMTP_PORT}, User: ${SMTP_USER}`);
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465, // true for 465, false for other ports
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
} else {
  console.warn(
    '⚠️  SMTP Mail Service is not configured. Email dispatches will be mocked and printed to the terminal console.\n' +
    '   To enable actual email alerts, configure SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS in your .env file.'
  );
}

/**
 * Escape values for CSV cell formatting.
 */
function escapeCSV(val) {
  const stringVal = val === null || val === undefined ? '' : String(val);
  return `"${stringVal.replace(/"/g, '""')}"`;
}

/**
 * Compile a list of articles into a standardized CSV string.
 */
function generateArticlesCSV(articles) {
  if (!articles || articles.length === 0) return '';
  const headers = ['Title', 'Date', 'Source', 'Sentiment', 'Impact', 'Region', 'URL'];
  const rows = articles.map(a => [
    escapeCSV(a.title),
    escapeCSV(a.published_at ? new Date(a.published_at).toLocaleString() : ''),
    escapeCSV(a.source),
    escapeCSV(a.sentiment),
    escapeCSV(a.impact_score),
    escapeCSV(a.region),
    escapeCSV(a.url),
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

/**
 * Dispatch alert email to a subscriber.
 */
async function sendAlertEmail({ toEmail, score, narrative, articles }) {
  const csvContent = generateArticlesCSV(articles);

  const subject = `[Alert] Bangladesh Investment Climate Score dropped to ${score}/100`;

  const frontendBase = (process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',')[0].trim() : 'http://localhost:8080');
  const unsubscribeUrl = `${frontendBase}?unsubscribe=${encodeURIComponent(toEmail)}`;

  const htmlContent = `
    <div style="font-family: 'Sora', 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px border #e2e8f0; rounded: 8px; background-color: #ffffff;">
      <div style="background-color: #527F76; padding: 24px; text-align: center; border-radius: 6px 6px 0 0; color: #ffffff;">
        <h1 style="margin: 0; font-size: 20px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">BIDA Intelligence Command Center</h1>
      </div>
      <div style="padding: 24px; color: #0f172a; line-height: 1.6;">
        <h2 style="font-size: 18px; font-weight: 700; margin-top: 0; color: #dc2626;">⚠️ Climate Score Alert</h2>
        <p style="font-size: 14px; margin-bottom: 20px;">
          The overall investment climate score has dropped below your configured threshold to: 
          <strong style="font-size: 18px; color: #dc2626; font-family: monospace;">${score}/100</strong>.
        </p>
        
        <div style="background-color: #f8fafc; border-left: 4px solid #527F76; padding: 16px; margin-bottom: 24px; border-radius: 0 4px 4px 0;">
          <h3 style="margin: 0 0 8px 0; font-size: 13px; font-weight: 700; text-transform: uppercase; color: #64748b; tracking-wider: 0.05em;">AI Executive Summary</h3>
          <p style="margin: 0; font-size: 14px; font-style: italic; color: #334155;">"${narrative}"</p>
        </div>

        <p style="font-size: 13px; color: #64748b; margin-bottom: 0;">
          A full report containing the articles from the last 7 days that contributed to this score has been compiled and attached as a CSV file: 
          <code style="background-color: #f1f5f9; padding: 2px 4px; border-radius: 4px; font-size: 12px; font-family: monospace;">bd_investment_news_report.csv</code>.
        </p>
      </div>
      <div style="border-top: 1px solid #e2e8f0; padding: 16px 24px; text-align: center; font-size: 10px; color: #94a3b8; font-family: monospace; text-transform: uppercase; letter-spacing: 0.1em; line-height: 1.5;">
        Bangladesh Investment Development Authority (BIDA)
        <br/><br/>
        <a href="${unsubscribeUrl}" style="color: #94a3b8; text-decoration: underline;">Unsubscribe from these alerts</a>
      </div>
    </div>
  `;

  if (!transporter) {
    console.log(`\n--- MOCK EMAIL DISPATCH ---`);
    console.log(`To: ${toEmail}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body Brief: ${narrative}`);
    console.log(`CSV Row Count: ${articles.length} lines`);
    console.log(`---------------------------\n`);
    return { mockSent: true };
  }

  const mailOptions = {
    from: ALERT_FROM_EMAIL,
    to: toEmail,
    subject: subject,
    html: htmlContent,
    attachments: [
      {
        filename: 'bd_investment_news_report.csv',
        content: csvContent,
        contentType: 'text/csv',
      },
    ],
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Alert email sent to ${toEmail}: messageId=${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Failed to send alert email to ${toEmail}:`, error);
    throw error;
  }
}

module.exports = {
  generateArticlesCSV,
  sendAlertEmail,
};
