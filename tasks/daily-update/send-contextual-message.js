const { Pool } = require('pg');
const Expo = require('expo-server-sdk');

const connectionString = process.env.DATABASE_URL;
const expo = new Expo();

module.exports = ({ token }, callback) => {
  console.log('send sendContextualMessages called token', token);
  callback(null);
  // get luvups/jalapenos for last day
  // if no luvups or jalapenos
  // if jalapenos
  // if luvups
};
