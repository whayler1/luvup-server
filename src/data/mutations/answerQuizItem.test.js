import { graphql } from 'graphql';
// import uuid from 'uuid/v1';
import sequelize from '../sequelize';
import schema from '../schema';
import createLoggedInUser from '../test-helpers/create-logged-in-user';
// import { QuizItem } from '../models';
import { PermissionError } from '../errors';
import { createQuizItemObj } from './createQuizItem';

describe('answerQuizItem', () => {
  describe('when user is logged in', () => {
    describe('and is answering an item they are the recipient of', () => {
      it('should return the updated quizItem', async () => {
        const { user, lover, rootValue } = await createLoggedInUser({
          isInRelationship: true,
        });
        const quizItem = await createQuizItemObj(
          lover,
          user,
          'foo',
          2,
          ['a', 'b', 'c'],
          1,
        );

        const query = `mutation {
          answerQuizItem(
            quizItemId: "${quizItem.id}"
            recipientChoiceId: "${quizItem.choices[2].id}"
          ) {
            quizItem {
              id recipientChoiceId
            }
          }
        }`;

        const res = await graphql(schema, query, rootValue, sequelize);
        console.log('res', res);
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
  // describe('when user is logged in', () => {
  //   beforeAll(async () => {
  //     await models.sync();
  //   });
  //
  //   it('should create and return a quizItem', async () => {
  //     const query = `mutation {
  //       createQuizItem(
  //         question: "do you love me"
  //         reward: 2
  //         choices: ["a","b","c"]
  //         senderChoiceIndex: 1,
  //       ) {
  //         quizItem {
  //           id
  //           question
  //           senderChoiceId
  //           recipientChoiceId
  //           reward
  //           isArchived
  //           createdAt
  //           updatedAt
  //           relationshipId
  //           senderId
  //           recipientId
  //           choices { id answer }
  //         }
  //       }
  //     }`;
  //     const { user, lover, rootValue } = await createLoggedInUser({
  //       isInRelationship: true,
  //     });
  //
  //     const { data: { createQuizItem: { quizItem } } } = await graphql(
  //       schema,
  //       query,
  //       rootValue,
  //       sequelize,
  //     );
  //
  //     expect(quizItem).toEqual(
  //       expect.objectContaining({
  //         question: 'do you love me',
  //         senderChoiceId: quizItem.choices[1].id,
  //         recipientChoiceId: null,
  //         reward: 2,
  //         isArchived: false,
  //         relationshipId: user.RelationshipId,
  //         senderId: user.id,
  //         recipientId: lover.id,
  //         choices: expect.arrayContaining([
  //           expect.objectContaining({ answer: 'a' }),
  //           expect.objectContaining({ answer: 'b' }),
  //           expect.objectContaining({ answer: 'c' }),
  //         ]),
  //       }),
  //     );
  //   });
  // });
});
