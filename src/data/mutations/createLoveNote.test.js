import { graphql } from 'graphql';
import sequelize from '../sequelize';
import schema from '../schema';
import { createLoggedInUser } from '../test-helpers';

describe('createLoveNote', () => {
  describe('when user logged in', () => {
    it('should allow user to create a love note', async () => {
      const { user, lover, rootValue } = await createLoggedInUser();
      const query = `mutation {
        createLoveNote(
          note: "meow meow"
        ) {
          loveNote {
            id
            note
            createdAt
            updatedAt
            relationshipId
            senderId
            recipientId
            isRead
            numJalapenos
            numLuvups
          }
        }
      }`;
      const { data: { createLoveNote: { loveNote } } } = await graphql(
        schema,
        query,
        rootValue,
        sequelize,
      );

      expect(loveNote).toEqual(
        expect.objectContaining({
          note: 'meow meow',
          relationshipId: user.RelationshipId,
          senderId: user.id,
          recipientId: lover.id,
          isRead: false,
          numJalapenos: 0,
          numLuvups: 0,
        }),
      );
    });
  });
});
