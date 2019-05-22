import upperFirst from 'lodash/upperFirst';

import sendPushNotification from './sendPushNotification';

export default (sender, recipient) =>
  sendPushNotification(
    recipient.id,
    `${upperFirst(sender.firstName)} ${upperFirst(
      sender.lastName,
    )} sent you a lover request! 💞`,
    {
      type: 'lover-request-received',
    },
  );
