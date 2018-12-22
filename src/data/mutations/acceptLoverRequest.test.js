import { graphql } from 'graphql';
import schema from '../schema';
import sequelize from '../sequelize';
import { UserNotLoggedInError, LoverRequestNotFoundError } from '../errors';
import createLoggedInUser, {
  createUser,
} from '../test-helpers/create-logged-in-user';

describe('acceptLoverRequest', () => {
  describe('when user is logged in', () => {
    describe('when no lover request with matching id exists', () => {
      it('should throw LoverRequestNotFoundError error', async () => {
        const { rootValue } = await createLoggedInUser({
          isInRelationship: false,
        });
        const query = `mutation {
          acceptLoverRequest(
            loverRequestId: "abc123"
          ) {
            loverRequest { id }
          }
        }`;
        const { errors: [firstError] } = await graphql(
          schema,
          query,
          rootValue,
          sequelize,
        );

        expect(firstError.message).toBe(LoverRequestNotFoundError.message);
      });
    });

    describe('when lover request exists', () => {
      it.only('foo', async () => {
        const { user, rootValue } = await createLoggedInUser({
          isInRelationship: false,
        });

        const user2 = await createUser();
        const loverRequest = await user2.createLoverRequest({
          recipientId: user.id,
        });

        const query = `mutation {
          acceptLoverRequest(
            loverRequestId: "${loverRequest.id}"
          ) {
            loverRequest { id }
          }
        }`;

        const res = await graphql(schema, query, rootValue, sequelize);

        console.log('res', res);
      });
    });
  });

  describe('when user is not logged in', () => {
    it('should throw UserNotLoggedInError', async () => {
      const query = `mutation {
        acceptLoverRequest(
          loverRequestId: "abc123"
        ) {
          loverRequest { id }
        }
      }`;
      const { errors: [firstError] } = await graphql(
        schema,
        query,
        {},
        sequelize,
      );

      expect(firstError.message).toBe(UserNotLoggedInError.message);
    });
  });
});
