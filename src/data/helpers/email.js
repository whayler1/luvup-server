import nodemailer from 'nodemailer';

import config from '../../config';

const { inviteFromEmail, inviteFromPassword, disableEmail } = config;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: inviteFromEmail,
    pass: inviteFromPassword,
  },
});

const defaultOptions = {
  from: 'justin@luvup.io',
};

const sendEmail = options =>
  new Promise((resolve, reject) => {
    if (
      (!inviteFromEmail || !inviteFromPassword) &&
      process.env.NODE_ENV === 'development'
    ) {
      resolve();
    } else if (disableEmail === 'true') {
      resolve();
    } else {
      const mailOptions = Object.assign({}, defaultOptions, options);

      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          reject(err);
        } else {
          resolve(info);
        }
      });
    }
  });

export default {
  sendEmail,
};
