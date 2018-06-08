const superagent = require('superagent');
const _ = require('lodash');

const ROOT_URL = process.env.ROOT_URL;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

const updateRelationshipScore = async userId => {
  try {
    const res = superagent(`${ROOT_URL}/graphql`, {
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

exports.handler = async userId => {
  const res = await updateRelationshipScore(userId);
  return res;
};
