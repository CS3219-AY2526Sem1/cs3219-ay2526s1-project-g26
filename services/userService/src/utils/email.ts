// utils/email.ts
import nodemailer from 'nodemailer'
import { SMTP } from '../config'
import { getLogger } from './logger'

const logger = getLogger('email-service')

// 读取环境变量
const { HOST, PORT, USER, PASS } = SMTP

if (!HOST || !PORT || !USER || !PASS) {
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
    host: HOST,
    port: Number(PORT),
    secure: Number(PORT) === 465, // 465 端口使用 secure，587 不使用
    auth: {
      user: USER,
      pass: PASS,
    },
    tls: {
      // 避免 self-signed 或证书问题
      rejectUnauthorized: false,
    },
  })

  // 发送邮件
  const info = await transporter.sendMail({
    from: `"PeerPrep" <${USER}>`,
    to,
    subject,
    html: text,
  })

  logger.info('Email sent:', info.messageId)
}
