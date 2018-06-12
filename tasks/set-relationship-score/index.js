const { Pool } = require('pg');
const superagent = require('superagent');
const _ = require('lodash');

const ROOT_URL = process.env.ROOT_URL;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;
const connectionString = process.env.DATABASE_URL;

const getUsers = async pool => {
  const { rows } = await pool.query('select id from public."User";');

  return rows;
};

const updateRelationshipScore = async userId => {
  try {
    const res = await superagent.post(`${ROOT_URL}/graphql`, {
      query: `mutation {
        createRelationshipScore(
          userId: "${userId}",
          token: "${ADMIN_TOKEN}"
        ) {
          relationshipScore {
            id
          }
        }
      }`,
    });

    const relationshipScoreId = _.get(
      res,
      'body.data.createRelationshipScore.relationshipScore.id',
    );

    if (relationshipScoreId) {
      return { id: relationshipScoreId };
    }
    throw new Error('no relationship score');
  } catch (err) {
    throw new Error(err);
  }
};

exports.handler = async () => {
  const pool = await new Pool({ connectionString });
  const users = await getUsers(pool);

  await users.reduce(
    (p, user) =>
      p
        .then(async () => {
          try {
            const res = await updateRelationshipScore(user.id);
            return res;
          } catch (err) {
            throw new Error(err);
          }
        })
        .catch(err => console.log({ err })),
    Promise.resolve(),
  );

  pool.end();

  return 'omg';
};
