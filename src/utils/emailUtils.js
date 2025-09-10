import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail({to, subject, html, text}) {
  await resend.emails.send({
    from: "Sahabat Gula <noreply@sahabatgula.com>",
    to,
    subject,
    html,
    text
  })
}