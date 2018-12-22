export default {
  createTransport: () => ({
    sendMail: (mailOptions, cb) => {
      cb(null, 'mail sent');
    },
  }),
};
