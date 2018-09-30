import { graphql } from 'graphql';
import sequelize from '../sequelize';
import schema from '../schema';
import createLoggedInUser from '../test-helpers/create-logged-in-user';
import models from '../models';

describe('createQuizItem', () => {
  describe('when required args not provided', () => {
    it('should return required args error array', async () => {
      const query = `mutation {
        createQuizItem {
          quizItem { id }
        }
      }`;

      const result = await graphql(schema, query, {}, {});

      expect(result.errors).toHaveLength(4);
      expect(result.errors).toEqual(
        expect.arrayContaining([
          {
            message:
              'Field "createQuizItem" argument "question" of type "String!" is required but not provided.',
            locations: [{ line: 2, column: 9 }],
            path: undefined,
          },
          {
            message:
              'Field "createQuizItem" argument "reward" of type "Int!" is required but not provided.',
            locations: [{ line: 2, column: 9 }],
            path: undefined,
          },
          {
            message:
              'Field "createQuizItem" argument "choices" of type "[String]!" is required but not provided.',
            locations: [{ line: 2, column: 9 }],
            path: undefined,
          },
          {
            message:
              'Field "createQuizItem" argument "senderChoiceIndex" of type "Int!" is required but not provided.',
            locations: [{ line: 2, column: 9 }],
            path: undefined,
          },
        ]),
      );
    });
  });

  describe('when user is logged in', () => {
    beforeAll(async () => {
      await models.sync();
    });

    it('should create and return a quizItem', async () => {
      const query = `mutation {
        createQuizItem(
          question: "do you love me"
          reward: 2
          choices: ["a","b","c"]
          senderChoiceIndex: 1,
        ) {
          quizItem {
            id
            question
            senderChoiceId
            recipientChoiceId
            reward
            isArchived
            createdAt
            updatedAt
            relationshipId
            senderId
            recipientId
          }
        }
      }`;
      const { user, rootValue } = await createLoggedInUser();

      const { data: { createQuizItem: { quizItem } } } = await graphql(
        schema,
        query,
        rootValue,
        sequelize,
      );
      console.log('result:', quizItem);
      expect(quizItem).toEqual(
        expect.objectContaining({
          question: 'do you love me',
          // senderChoiceId: null,
          // recipientChoiceId: null,
          reward: 2,
          isArchived: false,
          // relationshipId: null,
          senderId: user.id,
          // recipientId: null,
        }),
      );
    });
  });

  describe('when user is not logged in', () => {});
});
