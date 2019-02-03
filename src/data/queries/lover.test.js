import { graphql } from 'graphql';

import schema from '../schema';
import sequelize from '../sequelize';
import { createLoggedInUser } from '../test-helpers';
import { generateScore } from '../helpers/relationshipScore';

describe('lover', () => {
  describe('when user is logged in', () => {
    describe('when lover exists', () => {
      let res;
      let lover;

      beforeAll(async () => {
        const loggedInUser = await createLoggedInUser();
        const { rootValue, user } = loggedInUser;
        lover = loggedInUser.lover;
        await Promise.all([generateScore(user), generateScore(lover)]);

        const query = `{
          lover {
            id email username firstName lastName
            relationshipScore { id createdAt updatedAt score relationshipId userId }
          }
        }`;

        res = await graphql(schema, query, rootValue, sequelize);
      });

      it('should return lover', () => {
        expect(res.data.lover).toMatchObject({
          id: lover.id,
          email: lover.email,
          username: lover.username,
          firstName: lover.firstName,
          lastName: lover.lastName,
        });
      });

      it('should return lovers relationship score', () => {
        expect(res.data.lover.relationshipScore).toMatchObject({
          score: 0,
          relationshipId: lover.RelationshipId,
          userId: lover.id,
        });
      });
    });
  });
});
