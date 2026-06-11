import { Logger } from '@nestjs/common';

const logger = new Logger('Mail');

export async function sendTransactionalEmail(
  to: string,
  subject: string,
  body: string,
): Promise<boolean> {
  const host = process.env.SMTP_HOST;
  if (!host) {
    logger.log(`[email→${to}] ${subject}\n${body.slice(0, 300)}`);
    return false;
  }
  const nodemailer = await import('nodemailer');
  const transport = nodemailer.createTransport({
    host,
    port: parseInt(process.env.SMTP_PORT ?? '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS ?? '' }
      : undefined,
  });
  await transport.sendMail({
    from: process.env.SMTP_FROM ?? 'noreply@p3-lms.local',
    to,
    subject,
    text: body,
  });
  return true;
}

export function isEmailDeliveryConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST?.trim());
}
