// utils/email.ts
import nodemailer from 'nodemailer'

// 读取环境变量
const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env

if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
  throw new Error('SMTP environment variables are not set properly')
}

/**
 * 发送邮件
 * @param to 收件人邮箱
 * @param subject 邮件主题
 * @param text 邮件内容
 */
export async function sendEmail(to: string, subject: string, text: string) {
  // 创建 transporter
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465, // 465 端口使用 secure，587 不使用
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
    tls: {
      // 避免 self-signed 或证书问题
      rejectUnauthorized: false,
    },
  })

  // 发送邮件
  const info = await transporter.sendMail({
    from: `"PeerPrep" <${SMTP_USER}>`,
    to,
    subject,
    text,
  })

  console.log('Email sent:', info.messageId)
}
