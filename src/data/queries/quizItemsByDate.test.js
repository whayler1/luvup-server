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

      const query = `{
        quizItemsByDate(
          startDate: "1981-05-31"
          endDate: "1981-06-2"
        ) {
          rows { createdAt }
        }
      }`;
      const res = await graphql(schema, query, rootValue, sequelize);
      console.log('res', res);
    });
  });
});
