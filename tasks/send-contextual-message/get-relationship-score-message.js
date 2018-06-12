const moment = require('moment');
const _ = require('lodash');

const connectionString = process.env.DATABASE_URL;

const now = moment();
const lastWeek = moment().subtract(1, 'w');

const getLover = async (pool, userId, relationshipId) => {
  const { rows: [lover] } = await pool.query(
    `select * from public."User" u where u."RelationshipId" = '${relationshipId}' and u.id != '${userId}';`,
  );
  return lover;
};

const randomReturnMessage = messages =>
  messages[Math.floor(Math.random() * messages.length)];

const getRandomMessage = () =>
  randomReturnMessage([
    "Weird vibes got you down? Maybe it's time to send someone a Luvup and let them know you care.",
    'They say only sending Luvups can mend a broken heart.',
    "Maybe if you had sent your lover more Luvups you wouldn't be in this situation in the first place.",
    'Let your lover know you care! Send a Luvup.',
  ]);

const getRelationshipScoreMessage = async (pool, token) => {
  const { userId, RelationshipId } = token;
  const lover = await getLover(pool, userId, RelationshipId);
  const lastWeekStr = lastWeek.format('YYYY-MM-DD');

  const { rows } = await pool.query(
    `select score from public."RelationshipScore" rs where rs."relationshipId" = '${RelationshipId}' and rs."userId" = '${userId}' and rs."createdAt" > '${lastWeekStr}' order by rs."createdAt" desc;`,
  );

  console.log('rows', rows);

  // const jalapenoRes = await pool.query(
  //   `select count(*) from public."Jalapeno" j where j."recipientId" = '${userId}' and j."createdAt" > '${yesterdayStr}';`,
  // );
  // const luvupRes = await pool.query(
  //   `select count(*) from public."Coin" l where l."recipientId" = '${userId}' and l."createdAt" > '${yesterdayStr}';`,
  // );
  //
  // const jalapenoCountStr = _.get(jalapenoRes, 'rows[0].count');
  // const luvupCountStr = _.get(luvupRes, 'rows[0].count');
  // const jalapenoCount = _.isString(jalapenoCountStr)
  //   ? +jalapenoCountStr
  //   : jalapenoCountStr;
  // const luvupCount = _.isString(luvupCountStr) ? +luvupCountStr : luvupCountStr;
  //
  // const userName = token.firstName.replace(/^\w/, c => c.toUpperCase());
  // const loverName = lover.firstName.replace(/^\w/, c => c.toUpperCase());
  // let message;
  //
  // if (jalapenoCount === 0 && luvupCount === 0) {
  //   message = getNoActivityMessage(userName, loverName);
  // } else if (jalapenoCount > 0 && luvupCount > 0) {
  //   message = getMixedActivityMessage(userName, loverName);
  // } else if (jalapenoCount > 0) {
  //   message = getNegativeActivityMessage(userName, loverName);
  // } else if (luvupCount > 0) {
  //   message = getPositiveActivityMessage(userName, loverName);
  // } else {
  //   message = getRandomMessage();
  // }

  return { token: 'foo', message: 'bar' };
};

module.exports = getRelationshipScoreMessage;
