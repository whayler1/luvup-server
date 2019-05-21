import upperFirst from 'lodash/upperFirst';
import emailHelper from '../data/helpers/email';

const senderEmail = (sender, recipient) =>
  emailHelper.sendEmail({
    to: sender.email,
    subject: `You sent lover request to ${recipient.email}!`,
    html: `<p>Hi ${sender.firstName},</p><p>You sent a lover request to ${recipient.firstName} ${recipient.lastName} at ${recipient.email}</p>`,
  });

const recipientEmail = (sender, recipient) =>
  emailHelper.sendEmail({
    to: recipient.email,
    subject: `You received a lover request from ${upperFirst(
      sender.firstName,
    )} ${upperFirst(sender.lastName)} on Luvup!`,
    html: `<p>Hi ${upperFirst(
      recipient.firstName,
    )},</p><p>You received a lover request from ${upperFirst(
      sender.firstName,
    )} ${upperFirst(
      sender.lastName,
    )} (${sender.email}) on Luvup! Log in to Luvup to accept or deny your new lover request.</p>`,
  });

const sendLoverRequestSentEmails = (sender, recipient) =>
  Promise.all([
    senderEmail(sender, recipient),
    recipientEmail(sender, recipient),
  ]);

export default sendLoverRequestSentEmails;
