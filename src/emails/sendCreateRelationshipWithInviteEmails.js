import upperFirst from 'lodash/upperFirst';
import emailHelper from '../data/helpers/email';

const sendSenderEmail = ({ sender, recipientEmail, recipientFirstName }) =>
  emailHelper.sendEmail({
    to: sender.email,
    subject: `You invited ${recipientEmail} to be in a relationship!`,
    html: `<p>Hi ${upperFirst(sender.firstName)},</p>
    <p>You invited ${recipientEmail} to be in a relationship on Luvup! We'll let you know when they accept. Until then you can use Luvup as you would. They'll see all the love you sent them when they sign up. Log into Luvup now and send ${upperFirst(
      recipientFirstName,
    )} something special! 🥰</p>
    `,
  });

const sendRecipientEmail = ({
  sender,
  recipientEmail,
  recipientFirstName,
  recipientLastName,
  userInviteId,
}) =>
  emailHelper.sendEmail({
    to: recipientEmail,
    subject: `${upperFirst(sender.firstName)} ${upperFirst(
      sender.lastName,
    )} invited you to be in a relationship on Luvup!`,
    html: `<p>Hi ${upperFirst(recipientFirstName)} ${upperFirst(
      recipientLastName,
    )},</p>
    <p>${upperFirst(sender.firstName)} ${upperFirst(
      sender.lastName,
    )} invited you to be in a relationship on Luvup!</p>
    <p>Luvup is an app that makes staying present in your relationship fun. Go to <a href="//luvup/${userInviteId}">//luvup/${userInviteId}</a> to accept (or deny) ${upperFirst(
      sender.firstName,
    )}'s invite.'</p>`,
  });

const sendCreateRelationshipWithInviteEmails = ({
  sender,
  recipientEmail,
  recipientFirstName,
  recipientLastName,
  userInviteId,
}) =>
  Promise.all([
    sendSenderEmail({ sender, recipientEmail, recipientFirstName }),
    sendRecipientEmail({
      sender,
      recipientEmail,
      recipientFirstName,
      recipientLastName,
      userInviteId,
    }),
  ]);

export default sendCreateRelationshipWithInviteEmails;
