import { sendEmails } from "../utils/mailJetConfig";

export const sendMail = async (user: any, subject: string, body: string) => {
    return await sendEmails({
      to: [
        { Email: `${user.email}`, Name: `${user.name} ${user.lastName}` }
      ],
      subject: subject,
      textMsg: body,
      htmlMsg: `
      <p>Hello ${user.name} ${user.lastName},</p>
      ${body}
      `,
    });
}