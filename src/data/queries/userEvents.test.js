import { graphql } from 'graphql';
import sequelize from '../sequelize';
import schema from '../schema';
import { createLoggedInUser } from '../test-helpers';
import { UserEvent } from '../models';

describe('userEvents', () => {
  describe('when user is logged in', () => {
    it('should return user events', async () => {
      const { user, rootValue } = await createLoggedInUser();
      const eventNames = ['coin-received', 'lovenote-sent', 'quiz-item-sent'];
      await UserEvent.bulkCreate(
        eventNames.map((name, i) => ({
          userId: user.id,
          relationshipId: user.RelationshipId,
          createdAt: `2018-01-0${i + 1}`,
          updatedAt: `2018-01-0${i + 1}`,
          name,
        })),
      );
      const query = `{
        userEvents(
          limit: 2
        ) {
          rows { name }
          count
          limit
          offset
        }
      }`;
      const { data: { userEvents: { rows, count } } } = await graphql(
        schema,
        query,
        rootValue,
        sequelize,
      );
      expect(rows).toHaveLength(2);
      expect(count).toEqual(3);
    });
  });
});
