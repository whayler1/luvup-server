import Expo from 'expo-server-sdk';
import _ from 'lodash';
import { ExpoPushToken } from '../../data/models';

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

// const invalidateErroredTokens = async (userId, erroredTokens) => {
//   await ExpoPushToken.update(
//     {
//       isValid: false,
//     },
//     {
//       where: {
//         userId,
//         isValid: true,
//         token: {
//           $or: erroredTokens,
//         },
//       },
//     },
//   );
// };

/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
const sendChunks = async chunks => {
  const erroredTokens = [];
  for (const chunk of chunks) {
    try {
      await expo.sendPushNotificationAsync(chunk);
    } catch (error) {
      console.error('error sending push tokens', error);
      erroredTokens.push(chunk.to);
    }
  }

  return { erroredTokens };
};
/* eslint-enable no-restricted-syntax */
/* eslint-enable no-await-in-loop */

const sendPushNotification = async (
  userId,
  body,
  data = {},
  sound = 'default',
  options = {},
) => {
  const tokens = await ExpoPushToken.findAll({
    where: {
      userId,
      isValid: true,
    },
  });
  if (_.isArray(tokens) && tokens.length) {
    const filteredTokens = getFilteredTokens(tokens);
    const dataAppend = {};
    if (!_.get(data, 'message')) {
      dataAppend.message = body;
    }
    const notifications = filteredTokens.map(token => ({
      to: token.token,
      body,
      data: {
        ...data,
        ...dataAppend,
      },
      sound,
      ...options,
    }));

    expo.chunkPushNotifications(notifications);
    await sendChunks(notifications);
  }
};

export default sendPushNotification;
