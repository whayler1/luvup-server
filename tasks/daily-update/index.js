const { Pool } = require('pg');
const Expo = require('expo-server-sdk');
const moment = require('moment');

const connectionString = process.env.DATABASE_URL;

const expo = new Expo();
const now = moment();
const yesterday = moment().subtract(1, 'd');

const getFilteredTokens = tokens =>
  tokens.filter(token => {
    const isValid = Expo.isExpoPushToken(token.token);
    return isValid;
  });

const getValidTokens = async pool => {
  const { rows } = await pool.query(
    'select token, "fullName", "userId", "RelationshipId" from public."ExpoPushToken" t, public."User" u where t."userId" = u.id and t."isValid" = true',
  );

  return rows;
};

const getLover = async (pool, userId, relationshipId) => {
  const { rows } = await pool.query(
    `select * from public."User" u where u."RelationshipId" = '${relationshipId}' and u.id != '${userId}';`,
  );
  return rows[0];
};

const getActivityMessage = async (pool, token) => {
  console.log('getActivityMessage');
  const { userId, RelationshipId } = token;
  const lover = await getLover(pool, userId, RelationshipId);

  const jalapenoCount = await pool.query(
    `select count(*) from public."Jalapeno" j where j."recipientId" = '${userId}' and j."createdAt" > '${yesterday.format(
      'YYYY-MM-DD',
    )}';`,
  );
  const luvupCount = await pool.query(
    `select count(*) from public."Coin" l where l."recipientId" = '${userId}' and l."createdAt" > '${yesterday.format(
      'YYYY-MM-DD',
    )}';`,
  );

  // console.log('\n\ntoken\n', token);
  // console.log('\n\nluvupCount', luvupCount, '\njalapenoCount', jalapenoCount);
  // get luvups/jalapenos for last day
  // if no luvups or jalapenos
  // if jalapenos
  // if luvups
  return { jalapenoCount, luvupCount };
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

// const messages = [
//   "Weird vibes got you down? Maybe it's time to send someone a Luvup and let them know you care.",
//   'They say only sending Luvups can mend a broken heart.',
//   "Maybe if you had sent your lover more Luvups you wouldn't be in this situation in the first place.",
//   'Let your lover know you care! Send a Luvup.',
//   "A Luvup a day keeps the sickening sadness of a lifetime of leneliness away… Just sayin'",
// ];
//
// const getMessage = () => messages[Math.floor(Math.random() * messages.length)];

exports.handler = async () => {
  const pool = await new Pool({ connectionString });
  const validTokens = await getValidTokens(pool);
  const filteredTokens = getFilteredTokens(validTokens);
  console.log('filteredTokens', filteredTokens);

  const promises = filteredTokens.map(
    token =>
      new Promise(resolve => {
        (async () => {
          console.log('async func');
          await getActivityMessage(pool, token);
          resolve();
        })();
      }),
  );

  console.log('promises', promises);
  // const promises = filteredTokens.map(token => new Promise((resolve) => async () => {
  //     console.log('inside promise');
  //     await getActivityMessage(pool, token);
  //     resolve();
  //   }
  // ));
  // console.log('promises', promises);
  //
  const res = await Promise.all(promises);

  console.log('after promise all', res);
  // const notifications = filteredTokens.map(token => ({
  //   to: token.token,
  //   body,
  //   data: {
  //     type: 'daily-update',
  //   },
  //   sound: 'default',
  // }));
  // console.log({ notifications });
  // const chunks = expo.chunkPushNotifications(notifications);

  // // await sendChunks(chunks);
  // const promises = filteredTokens.map(token =>
  //   new Promise(resolve => {
  //     sendContextualMessagesFarm(
  //       { token: token.token },
  //       (err, output) => resolve()
  //     );
  //   }));

  // console.log('\npromises', promises);

  // await Promise.all(promises);
  // workerFarm.end(sendContextualMessagesFarm);

  pool.end();

  return 'daily update done';
};
