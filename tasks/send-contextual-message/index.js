const { Pool } = require('pg');
const Expo = require('expo-server-sdk');
const moment = require('moment');
const _ = require('lodash');

const connectionString = process.env.DATABASE_URL;

const expo = new Expo();
const now = moment();
const yesterday = moment().subtract(1, 'd');

const getLover = async (pool, userId, relationshipId) => {
  const { rows } = await pool.query(
    `select * from public."User" u where u."RelationshipId" = '${relationshipId}' and u.id != '${userId}';`,
  );
  return rows[0];
};

const getNoActivityMessage = (userName, loverName) => {
  const messages = [
    `Hey ${userName}, looks like not a lot happened in your Luvup life yesterday. Taking a moment to send a Luvup to ${loverName} might make today a little brighter.`,
    `Slow day yesterday. Maybe send ${loverName} a Luvup and have some fun today 💞`,
    `Not a lot of activity yesterday. Maybe nudge ${loverName} with a Luvup 😉 You got this.`,
  ];

  return messages[Math.floor(Math.random() * messages.length)];
};

const getMixedActivityMessage = (userName, loverName) => {
  const messages = [
    `Looks like ${loverName} had some interesting feedback for you yesterday. Maybe set the tone today with a nice Luvup`,
    `It was the best of times, it was the worst of times, it was yesterday. Send ${loverName} a Luvup and make today a little brighter`,
  ];

  return messages[Math.floor(Math.random() * messages.length)];
};

const getNegativeActivityMessage = (userName, loverName) => {
  const messages = [
    `Ouch, looks like ${loverName} let you know how they felt yesterday. Couldn't hurt to send a Luvup.`,
    `Looks like you and ${loverName} hit a few bumps in the road yesterday. But today is new day. Send ${loverName} a Luvup and make today different`,
    `Maybe if you had sent ${loverName} more Luvups you wouldn't be in this position in the first place`,
  ];

  return messages[Math.floor(Math.random() * messages.length)];
};

const getPositiveActivityMessage = (userName, loverName) => {
  const messages = [
    `Yay ${userName}! Looks like you and ${loverName} had a good day yesterday. Keep the good vibes rolling by sending another Luvup 😘`,
    `Looks like ${loverName} had some positive feedback for you yesterday! Your Luvup life is on point.`,
    `Roses are red and violets are blue. ${loverName} sent ${userName} Luvups cuz they love you. NOW SEND MORE LUVUPS!`,
  ];

  return messages[Math.floor(Math.random() * messages.length)];
};

const randomMessages = [
  "Weird vibes got you down? Maybe it's time to send someone a Luvup and let them know you care.",
  'They say only sending Luvups can mend a broken heart.',
  "Maybe if you had sent your lover more Luvups you wouldn't be in this situation in the first place.",
  'Let your lover know you care! Send a Luvup.',
  "A Luvup a day keeps the sickening sadness of a lifetime of leneliness away… Just sayin'",
];

const getRandomMessage = () =>
  randomMessages[Math.floor(Math.random() * randomMessages.length)];

const getActivityMessage = async (pool, token) => {
  const { userId, RelationshipId } = token;
  const lover = await getLover(pool, userId, RelationshipId);

  const jalapenoRes = await pool.query(
    `select count(*) from public."Jalapeno" j where j."recipientId" = '${userId}' and j."createdAt" > '${yesterday.format(
      'YYYY-MM-DD',
    )}';`,
  );
  const luvupRes = await pool.query(
    `select count(*) from public."Coin" l where l."recipientId" = '${userId}' and l."createdAt" > '${yesterday.format(
      'YYYY-MM-DD',
    )}';`,
  );

  const jalapenoCountStr = _.get(jalapenoRes, 'rows[0].count');
  const luvupCountStr = _.get(luvupRes, 'rows[0].count');
  const jalapenoCount = _.isString(jalapenoCountStr)
    ? +jalapenoCountStr
    : jalapenoCountStr;
  const luvupCount = _.isString(luvupCountStr) ? +luvupCountStr : luvupCountStr;

  const userName = token.firstName.replace(/^\w/, c => c.toUpperCase());
  const loverName = lover.firstName.replace(/^\w/, c => c.toUpperCase());
  let message;

  if (jalapenoCount === 0 && luvupCount === 0) {
    message = getNoActivityMessage(userName, loverName);
  } else if (jalapenoCount > 0 && luvupCount > 0) {
    message = getMixedActivityMessage(userName, loverName);
  } else if (jalapenoCount > 0) {
    message = getNegativeActivityMessage(userName, loverName);
  } else if (luvupCount > 0) {
    message = getPositiveActivityMessage(userName, loverName);
  } else {
    message = getRandomMessage();
  }

  return { token, message };
};

/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
const sendChunks = async chunks => {
  const erroredTokens = [];
  for (const chunk of chunks) {
    try {
      // await expo.sendPushNotificationAsync(chunk);
    } catch (error) {
      console.error('error sending push tokens', error);
      erroredTokens.push(chunk.to);
    }
  }

  return { erroredTokens };
};
/* eslint-enable no-restricted-syntax */
/* eslint-enable no-await-in-loop */

exports.handler = async userAndToken => {
  const pool = await new Pool({ connectionString });
  const token = JSON.parse(userAndToken);
  const res = await getActivityMessage(pool, token);

  pool.end();

  return JSON.stringify(res);
};
