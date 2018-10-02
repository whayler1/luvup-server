import { graphql } from 'graphql';
import _ from 'lodash';
import moment from 'moment';
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
        {
          createdAt: moment('05/30/1981').subtract(i, 'days').toDate(),
        },
      ),
    ),
  );

describe('receivedQuizItems', () => {
  beforeAll(async () => {
    await models.sync();
  });

  describe('when user logged in', () => {
    it('should return received quiz items and not sent quiz items', async () => {
      const { user, lover, rootValue } = await createLoggedInUser({
        isInRelationship: true,
      });
      await generateQuizItems(3, lover, user);
      await generateQuizItems(1, user, lover);

      const query = `{
        receivedQuizItems {
          rows {
            question
            senderId
            recipientId
            relationshipId
            createdAt
          }
          count
        }
      }`;

      const res = await graphql(schema, query, rootValue, sequelize);
      const { data: { receivedQuizItems: { rows } } } = res;
      console.log('res', rows);
      expect(rows).toHaveLength(3);
      expect(rows[0]).toEqual(
        expect.objectContaining({
          question: 'question0',
          senderId: lover.id,
          recipientId: user.id,
          relationshipId: user.RelationshipId,
          createdAt: 'Sat May 30 1981 00:00:00 GMT-0400 (EDT)',
        }),
      );
      expect(rows[1]).toEqual(
        expect.objectContaining({
          question: 'question1',
          senderId: lover.id,
          recipientId: user.id,
          relationshipId: user.RelationshipId,
          createdAt: 'Fri May 29 1981 00:00:00 GMT-0400 (EDT)',
        }),
      );
      expect(rows[2]).toEqual(
        expect.objectContaining({
          question: 'question2',
          senderId: lover.id,
          recipientId: user.id,
          relationshipId: user.RelationshipId,
          createdAt: 'Thu May 28 1981 00:00:00 GMT-0400 (EDT)',
        }),
      );
    });
  });
});
