import { graphql } from 'graphql';
import sequelize from '../sequelize';
import schema from '../schema';
import { QuizItem } from '../models';
import createLoggedInUser from '../test-helpers/create-logged-in-user';
import { UserNotLoggedInError } from '../errors';
import { generateQuizItems, modelsSync } from '../test-helpers';

const setQuizItemAnswered = quizItem =>
  QuizItem.update(
    { recipientChoiceId: quizItem.choices[0].id },
    { where: { id: quizItem.id } },
  );

describe('receivedUnansweredQuizItems', () => {
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
    it('should return received quiz items that are unanswered and not sent or answered quiz items', async () => {
      const { user, lover, rootValue } = await createLoggedInUser({
        isInRelationship: true,
      });
      const [qi0, qi1, qi2, qi3] = await generateQuizItems(5, lover, user);
      await generateQuizItems(1, user, lover);
      const answeredQuizItems = [qi0, qi2];
      await Promise.all(
        answeredQuizItems.map(quizItem => setQuizItemAnswered(quizItem)),
      );

      const query = `{
        receivedUnansweredQuizItems( limit: 2 ) {
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
          count
        }
      }`;

      const res = await graphql(schema, query, rootValue, sequelize);
      const { data: { receivedUnansweredQuizItems: { rows, count } } } = res;

      expect(count).toBe(3);
      expect(rows).toHaveLength(2);
      expect(rows[0]).toEqual(
        expect.objectContaining({
          id: qi1.id,
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
      expect(rows[1]).toEqual(
        expect.objectContaining({
          id: qi3.id,
          question: 'question3',
          senderId: lover.id,
          recipientId: user.id,
          relationshipId: user.RelationshipId,
          // createdAt: 'Wed May 27 1981 00:00:00 GMT-0400 (EDT)',
          choices: expect.arrayContaining([
            { answer: 'a3' },
            { answer: 'b3' },
            { answer: 'c3' },
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
