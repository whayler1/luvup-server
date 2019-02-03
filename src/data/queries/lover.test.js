import { graphql } from 'graphql';

import schema from '../schema';
import sequelize from '../sequelize';
import { createLoggedInUser } from '../test-helpers';

describe('lover', () => {
  describe('when user is logged in', () => {
    describe('when lover exists', () => {
      // let user;
      let res;

      beforeAll(async () => {
        // create req
        const loggedInUser = await createLoggedInUser();
        // user = loggedInUser.user;
        const { rootValue } = loggedInUser;

        const query = `{
          lover {
            id email username firstName lastName
            relationshipScore { id createdAt updatedAt score relationshipId userId }
          }
        }`;

        res = await graphql(schema, query, rootValue, sequelize);
      });

      it('should return lover', () => {
        console.log('\n\n -- res', res);
      });
    });
  });
});
