const { Pool } = require('pg');
const Expo = require('expo-server-sdk');

const connectionString = process.env.DATABASE_URL;

const expo = new Expo();

const getFilteredTokens = tokens =>
  tokens.filter(token => {
    const isValid = Expo.isExpoPushToken(token.token);
    return isValid;
  });

const getValidTokens = async () => {
  const pool = await new Pool({ connectionString });
  const { rows } = await pool.query(
    'select * from public."ExpoPushToken" where "isValid" = true',
  );
  pool.end();

  return rows;
};

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

exports.handler = async () => {
  const validTokens = await getValidTokens();
  const filteredTokens = getFilteredTokens(validTokens);

  const notifications = filteredTokens.map(token => ({
    to: token.token,
    body: 'Let your lover know you care! Send a love up.',
    data: {
      type: 'daily-update',
    },
    sound: 'default',
  }));
  const chunks = expo.chunkPushNotifications(notifications);

  await sendChunks(notifications);

  console.log('validTokens', validTokens);

  return 'daily update done';
};
