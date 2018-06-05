/* eslint-disable import/no-unresolved */
const aws = require('aws-sdk');
/* eslint-enable import/no-unresolved */
const { Pool } = require('pg');
const Expo = require('expo-server-sdk');

const connectionString = process.env.DATABASE_URL;

const expo = new Expo();

const getFilteredTokens = tokens =>
  tokens.filter(token => {
    const isValid = Expo.isExpoPushToken(token.token);
    return isValid;
  });

const getValidTokens = async pool => {
  const { rows } = await pool.query(
    'select token, "fullName", "firstName", "userId", "RelationshipId" from public."ExpoPushToken" t, public."User" u where t."userId" = u.id and t."isValid" = true',
  );

  return rows;
};

exports.handler = async () => {
  const pool = await new Pool({ connectionString });
  const validTokens = await getValidTokens(pool);
  const filteredTokens = getFilteredTokens(validTokens);

  const lambda = new aws.Lambda({
    region: 'us-east-1',
  });

  const promises = filteredTokens.map(
    token =>
      new Promise(resolve => {
        lambda.invoke(
          {
            FunctionName: 'send-contextual-message',
            Payload: JSON.stringify(token),
          },
          (error, data) => {
            if (error) {
              resolve(error);
            } else if (data) {
              resolve(data);
            } else {
              resolve('no data');
            }
          },
        );
      }),
  );

  const promiseResponses = await Promise.all(promises);

  pool.end();

  return promiseResponses;
};
