import { graphql } from 'graphql';
import schema from '../schema';

describe('createQuizItem', () => {
  describe('when required args not provided', () => {
    it('should return required args console.error(); array', async () => {
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
              'Field "createQuizItem" argument "senderChoiceId" of type "ID!" is required but not provided.',
            locations: [{ line: 2, column: 9 }],
            path: undefined,
          },
        ]),
      );
    });
  });
  xit('should respond correctly when user not logged in', () => {
    expect(true).toBe(true);
  });
});
