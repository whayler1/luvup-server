import { graphql } from 'graphql';
import sequelize from '../sequelize';
import schema from '../schema';
import createLoggedInUser from '../test-helpers/create-logged-in-user';
import { UserNotLoggedInError } from '../errors';
import { generateQuizItems, modelsSync } from '../test-helpers';

describe('receivedQuizItems', () => {
  let originalTimeout;

  beforeAll(async () => {
    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;
    await modelsSync;
  });

  afterAll(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
  });

  describe('when user logged in', () => {
    it('should return received quiz items and not sent quiz items', async () => {
      const { user, lover, rootValue } = await createLoggedInUser({
        isInRelationship: true,
      });
      await generateQuizItems(5, lover, user);
      await generateQuizItems(1, user, lover);

      const query = `{
        receivedQuizItems(limit: 3) {
          rows {
            question
            senderId
            recipientId
            relationshipId
            createdAt
            choices {
              answer
            }
          }
          count
        }
      }`;

      const res = await graphql(schema, query, rootValue, sequelize);
      const { data: { receivedQuizItems: { rows, count } } } = res;

      expect(count).toBe(5);
      expect(rows).toHaveLength(3);
      expect(rows[0]).toEqual(
        expect.objectContaining({
          question: 'question0',
          senderId: lover.id,
          recipientId: user.id,
          relationshipId: user.RelationshipId,
          // createdAt: 'Sat May 30 1981 00:00:00 GMT-0400 (EDT)',
          choices: expect.arrayContaining([
            { answer: 'a0' },
            { answer: 'b0' },
            { answer: 'c0' },
          ]),
        }),
      );
      expect(rows[1]).toEqual(
        expect.objectContaining({
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
        receivedQuizItems {
          rows { id }
        }
      }`;

      const { errors } = await graphql(schema, query, {}, sequelize);
      expect(errors[0].message).toBe(UserNotLoggedInError.message);
    });
  });
});
