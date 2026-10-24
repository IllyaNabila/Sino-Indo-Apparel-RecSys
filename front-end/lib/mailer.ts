import nodemailer from 'nodemailer';

export async function sendResetEmail(to: string, resetLink: string) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM } = process.env;

  // If SMTP not configured, just log link (dev mode)
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !EMAIL_FROM) {
    console.log("[DEV] Password reset link:", resetLink);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: false,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  await transporter.sendMail({
    from: EMAIL_FROM,
    to,
    subject: "Reset your password",
    text: `Reset your password using this link (valid for 30 minutes): ${resetLink}`,
    html: `<p>Reset your password (valid for 30 minutes):</p><p><a href="${resetLink}">${resetLink}</a></p>`,
  });
}
