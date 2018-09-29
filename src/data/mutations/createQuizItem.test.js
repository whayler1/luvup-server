import { graphql } from 'graphql';
import schema from '../schema';

describe('createQuizItem', () => {
  describe('when question arg not provided', () => {
    it('should throw an error', async () => {
      const query = `mutation {
        createQuizItem {
          quizItem { id }
        }
      }`;

      const result = await graphql(schema, query, {}, {});
      console.log('result', result);
    });
  });
  xit('should respond correctly when user not logged in', () => {
    expect(true).toBe(true);
  });
});
