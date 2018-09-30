import { graphql } from 'graphql';
import sequelize from '../sequelize';
import schema from '../schema';
import createLoggedInUser from '../test-helpers/create-logged-in-user';
import { PermissionError } from '../errors';
import { createQuizItemObj } from './createQuizItem';

describe('answerQuizItem', () => {
  describe('when user is logged in', () => {
    describe('and is answering an item they are the recipient of', () => {
      it('should return the updated quizItem and coins', async () => {
        const { user, lover, rootValue } = await createLoggedInUser({
          isInRelationship: true,
        });
        const originalQuizItem = await createQuizItemObj(
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
            quizItem { recipientChoiceId }
            coins { relationshipId senderId recipientId }
          }
        }`;

        const res = await graphql(schema, query, rootValue, sequelize);
        const { data: { answerQuizItem: { quizItem, coins } } } = res;

        expect(quizItem.recipientChoiceId).toEqual(recipientChoiceId);
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

      it("should return an empty coins array if answer doesn't match", async () => {
        const { user, lover, rootValue } = await createLoggedInUser({
          isInRelationship: true,
        });
        const originalQuizItem = await createQuizItemObj(
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

    xdescribe('and is answering an item they are not the recipient of', () => {
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
