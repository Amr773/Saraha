import { createTransport } from "nodemailer";
import { MAIL_USER, MAIL_PASS } from "../../../config/config.service.js";

const transporter = createTransport({
  service: "gmail",
  auth: {
    user: MAIL_USER,
    pass: MAIL_PASS,
  },
});

async function sendEmail({ to, subject, text, html, attachments }) {
  const info = await transporter.sendMail({
    from: `Route <${MAIL_USER}>`,
    to,
    subject,
    text,
    html,
    attachments,
  });
}

export default sendEmail;
