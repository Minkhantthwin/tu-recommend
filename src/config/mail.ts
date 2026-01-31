import nodemailer from 'nodemailer';

export const mailTransporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'localhost',
  port: parseInt(process.env.MAIL_PORT || '1025'),
  secure: false, // Mailpit doesn't use TLS
  auth: process.env.MAIL_USER
    ? {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      }
    : undefined,
});

export const MAIL_FROM = process.env.MAIL_FROM || 'noreply@tu-recommend.local';

// Verify connection
export async function verifyMailConnection(): Promise<boolean> {
  try {
    await mailTransporter.verify();
    console.log('📧 Mail server connected');
    return true;
  } catch (error) {
    console.warn('⚠️ Mail server not available:', error);
    return false;
  }
}
