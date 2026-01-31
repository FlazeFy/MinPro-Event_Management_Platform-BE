import { transport } from "../configs/nodemailer"

export const sendEmail = async (email: string, topic: string, template: string) => {
    await transport.sendMail({
        from: process.env.MAIL_SENDER,
        to: email,
        subject: topic,
        html: template
    })
}