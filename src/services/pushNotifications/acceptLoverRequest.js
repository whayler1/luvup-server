import sendPushNotification from './sendPushNotification';

export default (sender, recipient) =>
  sendPushNotification(
    sender.id,
    `${recipient.fullName} has accepted your lover request! 💞`,
    {
      type: 'lover-request-accepted',
    },
  );
