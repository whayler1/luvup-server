import Expo from 'expo-server-sdk';
import { ExpoPushToken } from '../data/models';

// Create a new Expo SDK client
const expo = new Expo();

const getFilteredTokens = tokens =>
  tokens.filter(token => {
    const isValid = Expo.isExpoPushToken(token.token);

    if (!isValid) {
      token.update({ isValid: false });
    }
    return isValid;
  });

/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
const sendChunks = async chunks => {
  for (const chunk of chunks) {
    try {
      const receipts = await expo.sendPushNotificationsAsync(chunk);
      console.log(receipts);
    } catch (error) {
      console.error(error);
    }
  }
};
/* eslint-enable no-restricted-syntax */
/* eslint-enable no-await-in-loop */

export const sendPushNotification = async (
  userId,
  body,
  data = {},
  sound = 'default',
) => {
  const tokens = await ExpoPushToken.findAll({
    where: {
      userId,
      isValid: true,
    },
  });
  const filteredTokens = getFilteredTokens(tokens);
  const notifications = filteredTokens.map(token => ({
    to: token.token,
    body,
    data,
    sound,
  }));

  console.log('\n\n filterTokens', { filteredTokens }, '\n\n notifications', {
    notifications,
  });

  const chunks = expo.chunkPushNotifications(notifications);

  sendChunks(chunks);

  // console.log('\n\n sendPushNotification');
  // if (!Expo.isExpoPushToken(expoPushToken)) {
  //   console.error(`Push token ${expoPushToken} is not a valid Expo push token`);
  //   return;
  // }
  // console.log('\n\n sendPushNotification\n-----', expoPushToken);
  //
  // const notification = {
  //   to: expoPushToken,
  //   body,
  //   data,
  //   sound,
  // };
  //
  // // The Expo push notification service accepts batches of notifications so
  // // that you don't need to send 1000 requests to send 1000 notifications. We
  // // recommend you batch your notifications to reduce the number of requests
  // // and to compress them (notifications with similar content will get
  // // compressed).
  // // const chunks = expo.chunkPushNotifications([notification]);
  //
  // try {
  //   const receipt = await expo.sendPushNotificationsAsync(notification);
  //   console.log(receipt);
  // } catch (error) {
  //   console.error(error);
  // }
};

export default {
  sendPushNotification,
};

// Create the messages that you want to send to clents
// let messages = [];
// for (let pushToken of somePushTokens) {
//   // Each push token looks like ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]
//
//   // Check that all your push tokens appear to be valid Expo push tokens
//   if (!Expo.isExpoPushToken(pushToken)) {
//     console.error(`Push token ${pushToken} is not a valid Expo push token`);
//     continue;
//   }
//
//   // Construct a message (see https://docs.expo.io/versions/latest/guides/push-notifications.html)
//   messages.push({
//     to: pushToken,
//     sound: 'default',
//     body: 'This is a test notification',
//     data: { withSome: 'data' },
//   })
// }
