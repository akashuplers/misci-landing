import mj from "node-mailjet";

export const fromSender = {
  email: "info@nowigence.com",
  // email: "arvind.ajimal@nowigence.com",
  name: "Nowigence Tech Team",
};

export const notifyNowigenceAddresses = [
  { Email: "jonathan.palacio@nowigence.com", Name: "Jon Palacio" },
  { Email: "jonathan.bernal@nowigence.com", Name: "Jon Bernal" },
];

let mjConn: any;
const init = async (): Promise<any> => {
  try {
    const connection: any = mj.connect(
      process.env.MJ_APIKEY_PUBLIC!,
      process.env.MJ_APIKEY_PRIVATE!
    );
    mjConn = connection;
    return mjConn;
  } catch (err) {
    console.log("error getting mailjet connected", err);
  }
};
init();

export { mjConn };

// Rename this because it doesn't just send an email

interface SendEmailArgs {
  email: string;
  name: string;
  subject: string;
  textMsg: string;
  htmlMsg: string;
}

export const sendEmail = async ({
  email,
  name,
  subject,
  textMsg,
  htmlMsg,
}: SendEmailArgs): Promise<any> => {
  const request = await mjConn.post("send", { version: "v3.1" }).request({
    Messages: [
      {
        From: {
          Email: fromSender.email,
          Name: fromSender.name,
        },
        To: [{ Email: email, Name: name }],
        Subject: subject,
        TextPart: textMsg,
        HTMLPart: htmlMsg,
      },
    ],
  });
  return request;
};

interface SendEmailsArgs {
  to: { Email: string; Name?: string }[];
  subject: string;
  textMsg: string;
  htmlMsg: string;
  attachments?: { fileName: string; contentType: string; content: string }[];
}

export const sendEmails = async ({
  to,
  subject,
  textMsg,
  htmlMsg,
  attachments,
}: SendEmailsArgs): Promise<any> => {
  const request = await mjConn.post("send", { version: "v3.1" }).request({
    Messages: [
      {
        From: {
          Email: fromSender.email,
          Name: fromSender.name,
        },
        To: to,
        Subject: subject,
        TextPart: textMsg,
        HTMLPart: htmlMsg,
        Attachments:
          attachments &&
          attachments.map((a) => {
            return {
              ContentType: a.contentType,
              Filename: a.fileName,
              Base64Content: new Buffer(a.content).toString("base64"),
            };
          }),
      },
    ],
  });
  return request;
};

interface ForgotPWArgs {
  email: string;
  userName: string;
  token: string;
}

export const sendForgotPasswordEmail = async ({
  email,
  userName,
  token,
}: ForgotPWArgs): Promise<any> => {
  const req = await mjConn.post("send", { version: "v3.1" }).request({
    Messages: [
      {
        From: {
          Email: fromSender.email,
          Name: fromSender.name,
        },
        To: [
          {
            Email: email,
            Name: userName,
          },
        ],
        TemplateID: 4782111,
        TemplateLanguage: true,
        Subject: `Lille Forgot Password`,
        Variables: {
          url: `<a href="${process.env.PLUARIS_BASE_URL}/resetPass?token=${token}"><button style="color: white; background: #45b8d5; padding: 6px 15px; border: none; border-radius: 6px; cursor: pointer; box-shadow: 2px 2px 4px #323232;">Change Password</button></a>`,
        },
      },
    ],
  });
  return req;
};
