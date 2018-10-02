import { graphql } from 'graphql';
import _ from 'lodash';
import sequelize from '../sequelize';
import schema from '../schema';
import models from '../models';
import createLoggedInUser from '../test-helpers/create-logged-in-user';
import { createQuizItemObj } from '../mutations/createQuizItem';

const generateQuizItems = (number, sender, recipient) =>
  Promise.all(
    _.times(number, i =>
      createQuizItemObj(
        sender,
        recipient,
        `question${i}`,
        2,
        [`a${i}`, `b${i}`, `c${i}`],
        1,
      ),
    ),
  );

describe('receivedQuizItems', () => {
  beforeAll(async () => {
    await models.sync();
  });

  describe('when user logged in', () => {
    it('should return received quiz items', async () => {
      const { user, lover, rootValue } = await createLoggedInUser({
        isInRelationship: true,
      });
      await generateQuizItems(5, lover, user);

      const query = `{
        receivedQuizItems {
          rows {
            question
            senderId
            recipientId
            relationshipId
          }
          count
        }
      }`;

      const res = await graphql(schema, query, rootValue, sequelize);
      console.log('res', res);
    });
  });
});
