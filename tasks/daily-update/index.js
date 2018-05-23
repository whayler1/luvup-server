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
    'select token, "fullName" from public."ExpoPushToken" t, public."User" u where t."userId" = u.id and t."isValid" = true',
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

const messages = [
  "Weird vibes got you down? Maybe it's time to send someone a Luvup and let them know you care.",
  'They say only sending Luvups can mend a broken heart.',
  "Maybe if you had sent your lover more Luvups you wouldn't be in this situation in the first place.",
  'Let your lover know you care! Send a Luvup.',
  "A Luvup a day keeps the sickening sadness of a lifetime of leneliness away… Just sayin'",
];

const getMessage = () => messages[Math.floor(Math.random() * messages.length)];

exports.handler = async () => {
  const validTokens = await getValidTokens();
  const filteredTokens = getFilteredTokens(validTokens);
  const body = getMessage();

  const notifications = filteredTokens.map(token => ({
    to: token.token,
    body,
    data: {
      type: 'daily-update',
    },
    sound: 'default',
  }));
  const chunks = expo.chunkPushNotifications(notifications);

  await sendChunks(notifications);

  return 'daily update done';
};
