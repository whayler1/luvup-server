import upperFirst from 'lodash/upperFirst';
import emailHelper from '../data/helpers/email';
import { getUserInviteLink } from '../services/deepLinks';

const sendInviteRecipientEmail = ({
  sender,
  recipientEmail,
  recipientFirstName,
  recipientLastName,
  userInviteId,
}) => {
  const userInviteLink = getUserInviteLink(userInviteId);
  return emailHelper.sendEmail({
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
    <p>Luvup is an app that makes staying present in your relationship fun. Go to <a href="${userInviteLink}">${userInviteLink}</a> to accept (or deny) ${upperFirst(
      sender.firstName,
    )}'s invite.'</p>`,
  });
};

export default sendInviteRecipientEmail;
