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
  const chunks = expo.chunkPushNotifications(notifications);

  sendChunks(chunks);
};

export default {
  sendPushNotification,
};
