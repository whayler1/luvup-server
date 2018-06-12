const { Pool } = require('pg');
const Expo = require('expo-server-sdk');
const moment = require('moment');
const _ = require('lodash');
const getLuvupJalapenoMessage = require('./get-luvup-jalapeno-message');
const getRelationshipScoreMessage = require('./get-relationship-score-message');

const connectionString = process.env.DATABASE_URL;
const expo = new Expo();

const messageTypes = [getLuvupJalapenoMessage, getRelationshipScoreMessage];

const getRandomMessageType = () =>
  messageTypes[Math.floor(Math.random() * messageTypes.length)];

exports.handler = async userAndToken => {
  const pool = await new Pool({ connectionString });
  const { token, message } = await getRandomMessageType()(pool, userAndToken);

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
