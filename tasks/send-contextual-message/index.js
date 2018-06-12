const { Pool } = require('pg');
const Expo = require('expo-server-sdk');
const moment = require('moment');
const _ = require('lodash');
const getLuvupJalapenoMessage = require('./get-luvup-jalapeno-message');

const connectionString = process.env.DATABASE_URL;

const expo = new Expo();

exports.handler = async userAndToken => {
  const pool = await new Pool({ connectionString });
  const { token, message } = await getLuvupJalapenoMessage(pool, userAndToken);

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
