import { graphql } from 'graphql';
import schema from '../schema';
import sequelize from '../sequelize';
import { UserNotLoggedInError } from '../errors';

describe('requestLover', () => {
  describe('when user not logged in', () => {
    it('should return UserNotLoggedInError', async () => {
      const query = `mutation {
        requestLover(recipientId: "abc123") { id }
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
