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
          quizItem { id }
        }
      }`;
      const { rootValue } = await createLoggedInUser();

      const result = await graphql(schema, query, rootValue, sequelize);
      console.log('result:', result.data.createQuizItem.quizItem);
    });
  });

  describe('when user is not logged in', () => {});
});
