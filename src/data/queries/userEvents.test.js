import { graphql } from 'graphql';
import sequelize from '../sequelize';
import schema from '../schema';
import { createLoggedInUser } from '../test-helpers';
import { UserEvent } from '../models';
import { UserNotLoggedInError } from '../errors';

const getSuccessfulQuery = async offset => {
  const { user, rootValue } = await createLoggedInUser();
  const eventNames = ['coin-received', 'lovenote-sent', 'quiz-item-sent'];
  await UserEvent.bulkCreate(
    eventNames.map((name, i) => ({
      userId: user.id,
      relationshipId: user.RelationshipId,
      createdAt: new Date(`2018-01-0${i + 1}`),
      updatedAt: new Date(`2018-01-0${i + 1}`),
      name,
    })),
  );
  const offsetStr = offset ? `offset: ${offset}` : '';
  const query = `{
    userEvents(
      limit: 2 ${offsetStr}
    ) {
      rows { name }
      count
      limit
      offset
    }
  }`;
  const res = await graphql(schema, query, rootValue, sequelize);
  return { user, res };
};

describe('userEvents', () => {
  describe('when user is logged in', () => {
    it('should return user events starting with most recent', async () => {
      const {
        res: { data: { userEvents: { rows, count, limit, offset } } },
      } = await getSuccessfulQuery();

      expect(rows).toHaveLength(2);
      expect(count).toEqual(3);
      expect(rows[0]).toEqual(
        expect.objectContaining({
          name: 'quiz-item-sent',
        }),
      );
      expect(rows[1]).toEqual(
        expect.objectContaining({
          name: 'lovenote-sent',
        }),
      );
      expect(limit).toEqual(2);
      expect(offset).toBeNull();
    });

    it('should offset properly', async () => {
      const {
        res: { data: { userEvents: { rows, count } } },
      } = await getSuccessfulQuery(1);

      expect(rows).toHaveLength(2);
      expect(count).toEqual(3);
      expect(rows[0]).toEqual(
        expect.objectContaining({
          name: 'lovenote-sent',
        }),
      );
      expect(rows[1]).toEqual(
        expect.objectContaining({
          name: 'coin-received',
        }),
      );
    });
  });

  describe('when user is not logged in', () => {
    it('should throw an error', async () => {
      const query = `{
        userEvents {
          rows { id }
        }
      }`;

      const { errors } = await graphql(schema, query, {}, sequelize);
      expect(errors[0].message).toBe(UserNotLoggedInError.message);
    });
  });
});
