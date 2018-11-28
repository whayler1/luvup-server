import { graphql } from 'graphql';
import sequelize from '../sequelize';
import schema from '../schema';
import createLoggedInUser from '../test-helpers/create-logged-in-user';
import { PermissionError } from '../errors';
import { createQuizItem } from '../helpers';
import { UserEvent, QuizItemEvent } from '../models';
import { modelsSync } from '../test-helpers';

const getSuccessfulQuizItemAnswered = async () => {
  const { user, lover, rootValue } = await createLoggedInUser({
    isInRelationship: true,
  });
  const originalQuizItem = await createQuizItem(
    lover,
    user,
    'foo',
    2,
    ['a', 'b', 'c'],
    1,
  );
  const recipientChoiceId = originalQuizItem.choices[1].id;

  const query = `mutation {
    answerQuizItem(
      quizItemId: "${originalQuizItem.id}"
      recipientChoiceId: "${recipientChoiceId}"
    ) {
      quizItem {
        recipientChoiceId id
        choices { answer }
      }
      coins { relationshipId senderId recipientId }
    }
  }`;

  const res = await graphql(schema, query, rootValue, sequelize);

  return { res, user, lover, recipientChoiceId };
};

describe('answerQuizItem', () => {
  let originalTimeout;

  beforeAll(async () => {
    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;
    await modelsSync;
  });

  afterAll(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
  });

  describe('when user is logged in', () => {
    describe('and is answering an item they are the recipient of', () => {
      it('should return the updated quizItem, choices and coins', async () => {
        const {
          res: { data: { answerQuizItem: { quizItem, coins } } },
          user,
          lover,
          recipientChoiceId,
        } = await getSuccessfulQuizItemAnswered();

        expect(quizItem.recipientChoiceId).toEqual(recipientChoiceId);
        expect(quizItem.choices[0].answer).toEqual('a');
        expect(quizItem.choices[1].answer).toEqual('b');
        expect(quizItem.choices[2].answer).toEqual('c');
        expect(coins).toHaveLength(2);
        const coinExpectation = {
          relationshipId: user.RelationshipId,
          senderId: lover.id,
          recipientId: user.id,
        };
        expect(coins).toEqual(
          expect.arrayContaining([expect.objectContaining(coinExpectation)]),
        );
      });

      it('should create user events', async () => {
        const { user, lover } = await getSuccessfulQuizItemAnswered();

        const userEvents = await UserEvent.findAll({
          where: {
            relationshipId: user.RelationshipId,
          },
        });

        expect(userEvents).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              userId: user.id,
              name: 'quiz-item-received-answered',
              isViewed: false,
            }),
            expect.objectContaining({
              userId: lover.id,
              name: 'quiz-item-sent-answered',
              isViewed: false,
            }),
          ]),
        );
      });

      it('should create quiz item events', async () => {
        const {
          user,
          res: { data: { answerQuizItem: { quizItem } } },
        } = await getSuccessfulQuizItemAnswered();

        const userEvents = await UserEvent.findAll({
          where: {
            relationshipId: user.RelationshipId,
          },
        });

        const quizItemEvents = await QuizItemEvent.findAll({
          where: {
            quizItemId: quizItem.id,
            userEventId: {
              $or: userEvents.map(userEvent => userEvent.id),
            },
          },
        });

        expect(quizItemEvents).toHaveLength(2);
      });

      it("should return an empty coins array if answer doesn't match", async () => {
        const { user, lover, rootValue } = await createLoggedInUser({
          isInRelationship: true,
        });
        const originalQuizItem = await createQuizItem(
          lover,
          user,
          'foo',
          2,
          ['a', 'b', 'c'],
          1,
        );
        const recipientChoiceId = originalQuizItem.choices[2].id;

        const query = `mutation {
          answerQuizItem(
            quizItemId: "${originalQuizItem.id}"
            recipientChoiceId: "${recipientChoiceId}"
          ) {
            quizItem { recipientChoiceId }
            coins { relationshipId senderId recipientId }
          }
        }`;

        const res = await graphql(schema, query, rootValue, sequelize);
        const { data: { answerQuizItem: { quizItem, coins } } } = res;

        expect(quizItem.recipientChoiceId).toEqual(recipientChoiceId);
        expect(coins).toHaveLength(0);
      });
    });

    describe('and is answering an item they are not the recipient of', () => {
      it('should return a permission error', async () => {
        const { rootValue } = await createLoggedInUser({
          isInRelationship: true,
        });
        const anotherUser = await createLoggedInUser({
          isInRelationship: true,
        });
        const quizItem = await anotherUser.user.createSentQuizItem({
          question: 'foo',
          reward: 1,
          relationshipId: anotherUser.user.RelationshipId,
          recipientId: anotherUser.lover.id,
        });

        const query = `mutation {
          answerQuizItem(
            quizItemId: "${quizItem.id}"
            recipientChoiceId: "abc"
          ) {
            quizItem {
              id recipientChoiceId
            }
          }
        }`;

        const { errors } = await graphql(schema, query, rootValue, sequelize);

        expect(errors[0].message).toEqual(PermissionError.message);
      });
    });
  });
});
