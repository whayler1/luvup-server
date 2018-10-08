import { graphql } from 'graphql';
import sequelize from '../sequelize';
import schema from '../schema';
import createLoggedInUser from '../test-helpers/create-logged-in-user';
import { PermissionError } from '../errors';
import { createQuizItem } from '../helpers';

describe('archiveQuizItem', () => {
  describe('when user is logged in', () => {
    describe('and is archiving an item they are the recipient of', () => {
      it('should return the updated quizItem', async () => {
        const { user, lover, rootValue } = await createLoggedInUser({
          isInRelationship: true,
        });
        const originalQuizItem = await createQuizItem(
          user,
          lover,
          'foo',
          2,
          ['a', 'b', 'c'],
          1,
        );

        const query = `mutation {
          archiveQuizItem(
            quizItemId: "${originalQuizItem.id}"
          ) {
            quizItem {
              isArchived
            }
          }
        }`;

        const { data: { archiveQuizItem: { quizItem } } } = await graphql(
          schema,
          query,
          rootValue,
          sequelize,
        );

        expect(quizItem.isArchived).toBe(true);
      });
    });

    describe('and is answering an item they are not the sender of', () => {
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
          archiveQuizItem(
            quizItemId: "${quizItem.id}"
          ) {
            quizItem {
              isArchived
            }
          }
        }`;

        const { errors } = await graphql(schema, query, rootValue, sequelize);

        expect(errors[0].message).toEqual(PermissionError.message);
      });
    });
  });
});
