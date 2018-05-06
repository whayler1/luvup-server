import nodemailer from 'nodemailer';

import config from '../../config';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.inviteFromEmail,
    pass: config.inviteFromPassword,
  },
});

const defaultOptions = {
  from: 'justin@luvup.io',
};

const sendEmail = options =>
  new Promise((resolve, reject) => {
    if (config.disableEmail === 'true') {
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
