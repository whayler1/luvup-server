const { Pool } = require('pg');
const Expo = require('expo-server-sdk');
const moment = require('moment');
const _ = require('lodash');

const connectionString = process.env.DATABASE_URL;

const expo = new Expo();
const now = moment();
const yesterday = moment().subtract(1, 'd');

const getLover = async (pool, userId, relationshipId) => {
  const { rows: [lover] } = await pool.query(
    `select * from public."User" u where u."RelationshipId" = '${relationshipId}' and u.id != '${userId}';`,
  );
  return lover;
};

const randomReturnMessage = messages =>
  messages[Math.floor(Math.random() * messages.length)];

const getNoActivityMessage = (userName, loverName) =>
  randomReturnMessage([
    `Hey ${userName}, looks like not a lot happened in your Luvup life yesterday. Taking a moment to send a Luvup to ${loverName} might make today a little brighter.`,
    `Slow day yesterday. Maybe send ${loverName} a Luvup and have some fun today 💞`,
    `Not a lot of activity yesterday. Maybe nudge ${loverName} with a Luvup 😉 You got this.`,
    `Maybe today is a good day to send a Luvup. Isn't ${loverName} worth it?`,
  ]);

const getMixedActivityMessage = (userName, loverName) =>
  randomReturnMessage([
    `Looks like ${loverName} had some interesting feedback for you yesterday. Maybe set the tone today with a nice Luvup`,
    `It was the best of times, it was the worst of times, it was yesterday. Send ${loverName} a Luvup and make today a little brighter`,
    `Intersting day in your Luvup life yesterday! It could be time to send ${loverName} a Luvup and let them know you care 💖`,
  ]);

const getNegativeActivityMessage = (userName, loverName) =>
  randomReturnMessage([
    `Ouch, looks like ${loverName} let you know how they felt yesterday. Couldn't hurt to send a Luvup.`,
    `Looks like you and ${loverName} hit a few bumps in the road yesterday. But today is new day. Send ${loverName} a Luvup and make today different`,
    `Maybe if you had sent ${loverName} more Luvups you wouldn't be in this position in the first place`,
    `Don't let the jalapenoes get you down. Swipe up, send that Luvup and let ${loverName} know your still here!`,
    "A Luvup a day keeps the sickening sadness of a lifetime of leneliness away… Just sayin'",
  ]);

const getPositiveActivityMessage = (userName, loverName) =>
  randomReturnMessage([
    `Yay ${userName}! Looks like you and ${loverName} had a good day yesterday. Keep the good vibes rolling by sending another Luvup 😘`,
    `Looks like ${loverName} had some positive feedback for you yesterday! Your Luvup life is on point.`,
    `Roses are red, violets are blue. ${loverName} sent ${userName} Luvups cuz ${loverName} loves you. NOW SEND MORE LUVUPS!`,
    `Woohoo! Your Luvup game is on Fire right now 🔥❤️🔥. Send ${loverName} a Luvup and keep the good vibes flowing.`,
  ]);

const getRandomMessage = () =>
  randomReturnMessage([
    "Weird vibes got you down? Maybe it's time to send someone a Luvup and let them know you care.",
    'They say only sending Luvups can mend a broken heart.',
    "Maybe if you had sent your lover more Luvups you wouldn't be in this situation in the first place.",
    'Let your lover know you care! Send a Luvup.',
  ]);

const getActivityMessage = async (pool, token) => {
  const { userId, RelationshipId } = token;
  const lover = await getLover(pool, userId, RelationshipId);
  const yesterdayStr = yesterday.format('YYYY-MM-DD');

  const jalapenoRes = await pool.query(
    `select count(*) from public."Jalapeno" j where j."recipientId" = '${userId}' and j."createdAt" > '${yesterdayStr}';`,
  );
  const luvupRes = await pool.query(
    `select count(*) from public."Coin" l where l."recipientId" = '${userId}' and l."createdAt" > '${yesterdayStr}';`,
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

exports.handler = async userAndToken => {
  const pool = await new Pool({ connectionString });
  const { token, message } = await getActivityMessage(pool, userAndToken);

  const notification = {
    to: token.token,
    body: message,
    data: {
      type: 'daily-update',
    },
    sound: 'default',
  };

  await expo.sendPushNotificationAsync(notification);

  pool.end();

  return message;
};
