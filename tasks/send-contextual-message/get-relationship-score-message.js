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

const getPositiveMessage = (userName, loverName, points) =>
  randomReturnMessage([
    `Your relationship is on 🔥fire🔥! Your health score is up ${points} point${points >
    1
      ? 's'
      : ''} since last week! Do something nice for ${loverName} today and keep the good vibes flowing…`,
    `Yeah ${userName}, things are looking good. Your up ${points} point${points >
    1
      ? 's'
      : ''} from your relationship score this time last week. That's what happens when you treat ${loverName} right 😉`,
  ]);

const getNegativeMessage = (userName, loverName) =>
  randomReturnMessage([
    `Looks like your relationship score is slipping a bit. Maybe it's time to do something sweet for ${loverName} and get those Luvups?`,
    `Today might be the day to do something nice for ${loverName}. Your relationship score is dropping a little. You got this 😉`,
    `Is it cold ❄️ in here or is it just me? Your relationship score is slipping. It could be time to nudge ${loverName} and let them know you care.`,
  ]);

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

  const firstScore = +rows[0].score;
  const lastScore = +rows[rows.length - 1].score;

  const userName = token.firstName.replace(/^\w/, c => c.toUpperCase());
  const loverName = lover.firstName.replace(/^\w/, c => c.toUpperCase());
  let message;

  if (firstScore > lastScore) {
    message = getPositiveMessage(userName, loverName, firstScore - lastScore);
  } else if (firstScore < lastScore) {
    message = getNegativeMessage(userName, loverName);
  } else {
    message = getRandomMessage();
  }

  return { token, message };
};

module.exports = getRelationshipScoreMessage;
