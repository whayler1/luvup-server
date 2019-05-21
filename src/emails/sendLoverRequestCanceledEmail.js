import emailHelper from '../data/helpers/email';

const sendLoverRequestCanceledEmail = (user, recipient) =>
  emailHelper.sendEmail({
    to: user.email,
    subject: 'You canceled a lover request',
    html: `<p>Hi ${user.firstName},</p><p>You canceled a lover request you sent to ${recipient.email}</p>`,
  });

export default sendLoverRequestCanceledEmail;
