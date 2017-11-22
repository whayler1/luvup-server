import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.INVITE_FROM_EMAIL,
    pass: process.env.INVITE_FROM_PASSWORD,
  },
});

const defaultOptions = {
  from: 'justin@luvup.io',
};

const sendEmail = options =>
  new Promise((resolve, reject) => {
    const mailOptions = Object.assign({}, defaultOptions, options);

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        reject(err);
      } else {
        resolve(info);
      }
    });
  });

export default {
  sendEmail,
};
