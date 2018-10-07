import { graphql } from 'graphql';
import sequelize from '../sequelize';
import schema from '../schema';
import { generateQuizItems } from '../test-helpers';
import createLoggedInUser from '../test-helpers/create-logged-in-user';

describe('quizItemsByDate', () => {
  describe('when user is logged in', () => {
    it('should return quizItems between date params', async () => {
      const { user, lover, rootValue } = await createLoggedInUser({
        isInRelationship: true,
      });
      await generateQuizItems(4, user, lover);
      await generateQuizItems(4, lover, user);

      console.log('sentItems');

      const query = `{
        quizItemsByDate(
          endDate: "1981-05-28"
          startDate: "1981-05-30"
        ) {
          rows { createdAt }
        }
      }`;
      const { data: { quizItemsByDate: { rows } } } = await graphql(
        schema,
        query,
        rootValue,
        sequelize,
      );
      console.log('res', rows);
      expect(rows).toHaveLength(4);
    });
  });
});
