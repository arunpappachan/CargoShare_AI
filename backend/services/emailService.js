const crypto = require('crypto');
const nodemailer = require('nodemailer');

/**
 * Generate a cryptographically secure random token and its SHA-256 hash.
 */
function generateToken() {
  const plainToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = hashToken(plainToken);
  return { plainToken, hashedToken };
}

/**
 * Hash a plain token using SHA-256
 */
function hashToken(plainToken) {
  return crypto.createHash('sha256').update(plainToken).digest('hex');
}

/**
 * Get configured nodemailer transporter or null if not configured
 */
function getTransporter() {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10) || 587,
      secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return null;
}


/**
 * Send Password Reset Email (via SMTP or dev console logger)
 */
async function sendPasswordResetEmail({ email, name, plainToken }) {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const resetUrl = `${frontendUrl}/reset-password?token=${plainToken}&email=${encodeURIComponent(email)}`;
  const transporter = getTransporter();

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: process.env.FROM_EMAIL || '"CargoShare AI" <no-reply@cargoshare.ai>',
        to: `"${name || 'User'}" <${email}>`,
        subject: 'Reset your CargoShare AI Password',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px;">
            <h2 style="color: #0f172a;">Password Reset Request</h2>
            <p style="color: #475569; font-size: 15px; line-height: 1.6;">
              We received a request to reset the password for your CargoShare AI account. Click the button below to choose a new password.
            </p>
            <div style="margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #0284c7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p style="color: #94a3b8; font-size: 12px;">
              This link is valid for 1 hour and can only be used once. If you did not request a password reset, please disregard this email.
            </p>
            <p style="color: #cbd5e1; font-size: 11px; word-break: break-all;">
              Direct link: ${resetUrl}
            </p>
          </div>
        `,
      });
      console.log(`[Email Service] Real password reset email sent to ${email} (MessageId: ${info.messageId})`);
      return { success: true, resetUrl, mode: 'smtp' };
    } catch (err) {
      console.error('[Email Service] SMTP delivery failed, falling back to console:', err.message);
    }
  }

  // Development Logger / Fallback
  console.log('\n======================================================');
  console.log('🔐 [EMAIL SERVICE] Password Reset Link Generated');
  console.log('======================================================');
  console.log(`To: ${name || 'User'} <${email}>`);
  console.log(`Password Reset URL:\n👉 ${resetUrl}`);
  console.log('Expires in: 1 hour');
  console.log('======================================================\n');

  return { success: true, resetUrl, mode: 'dev_mock' };
}

module.exports = {
  generateToken,
  hashToken,
  sendPasswordResetEmail,
};
