import { graphql } from 'graphql';
import models from '../models';
import sequelize from '../sequelize';
import schema from '../schema';
import { UserNotLoggedInError } from '../errors';
import { generateQuizItems } from '../test-helpers';
import createLoggedInUser from '../test-helpers/create-logged-in-user';

describe('quizItemsByDate', () => {
  let originalTimeout;

  beforeAll(async () => {
    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;
    await models.sync();
  });

  afterAll(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
  });

  describe('when user is logged in', () => {
    it('should return quizItems between date params', async () => {
      const { user, lover, rootValue } = await createLoggedInUser({
        isInRelationship: true,
      });
      const [, sent1, sent2] = await generateQuizItems(4, user, lover);
      const [, received1, received2] = await generateQuizItems(4, lover, user);

      const query = `{
        quizItemsByDate(
          startDate: "1981-05-28"
          endDate: "1981-05-30"
        ) {
          rows {
            id
            question
            senderId
            recipientId
            relationshipId
            createdAt
            choices {
              answer
            }
          }
        }
      }`;
      const { data: { quizItemsByDate: { rows } } } = await graphql(
        schema,
        query,
        rootValue,
        sequelize,
      );

      expect(rows).toHaveLength(4);
      expect(rows[0]).toEqual(
        expect.objectContaining({
          id: sent1.id,
          question: 'question1',
          senderId: user.id,
          recipientId: lover.id,
          relationshipId: user.RelationshipId,
          // createdAt: 'Fri May 29 1981 00:00:00 GMT-0400 (EDT)',
          choices: expect.arrayContaining([
            { answer: 'a1' },
            { answer: 'b1' },
            { answer: 'c1' },
          ]),
        }),
      );
      expect(rows[1]).toEqual(
        expect.objectContaining({
          id: received1.id,
          question: 'question1',
          senderId: lover.id,
          recipientId: user.id,
          relationshipId: user.RelationshipId,
          // createdAt: 'Fri May 29 1981 00:00:00 GMT-0400 (EDT)',
          choices: expect.arrayContaining([
            { answer: 'a1' },
            { answer: 'b1' },
            { answer: 'c1' },
          ]),
        }),
      );
      expect(rows[2]).toEqual(
        expect.objectContaining({
          id: sent2.id,
          question: 'question2',
          senderId: user.id,
          recipientId: lover.id,
          relationshipId: user.RelationshipId,
          // createdAt: 'Thu May 28 1981 00:00:00 GMT-0400 (EDT)',
          choices: expect.arrayContaining([
            { answer: 'a2' },
            { answer: 'b2' },
            { answer: 'c2' },
          ]),
        }),
      );
      expect(rows[3]).toEqual(
        expect.objectContaining({
          id: received2.id,
          question: 'question2',
          senderId: lover.id,
          recipientId: user.id,
          relationshipId: user.RelationshipId,
          // createdAt: 'Thu May 28 1981 00:00:00 GMT-0400 (EDT)',
          choices: expect.arrayContaining([
            { answer: 'a2' },
            { answer: 'b2' },
            { answer: 'c2' },
          ]),
        }),
      );
    });
  });

  describe('when user is not logged in', () => {
    it('should throw a UserNotLoggedInError error', async () => {
      const query = `{
        receivedUnansweredQuizItems {
          rows { id }
        }
      }`;

      const { errors } = await graphql(schema, query, {}, sequelize);
      expect(errors[0].message).toBe(UserNotLoggedInError.message);
    });
  });
});
