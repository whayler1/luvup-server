import upperFirst from 'lodash/upperFirst';
import emailHelper from '../data/helpers/email';
import sendInviteRecipientEmail from './sendInviteRecipientEmail';

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

const sendCreateRelationshipWithInviteEmails = ({
  sender,
  recipientEmail,
  recipientFirstName,
  recipientLastName,
  userInviteId,
}) =>
  Promise.all([
    sendSenderEmail({ sender, recipientEmail, recipientFirstName }),
    sendInviteRecipientEmail({
      sender,
      recipientEmail,
      recipientFirstName,
      recipientLastName,
      userInviteId,
    }),
  ]);

export default sendCreateRelationshipWithInviteEmails;
