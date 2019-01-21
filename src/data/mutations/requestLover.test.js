import { graphql } from 'graphql';
import schema from '../schema';
import sequelize from '../sequelize';
import { UserNotLoggedInError } from '../errors';
import { LoverRequest } from '../models';
import createLoggedInUser, {
  createUser,
} from '../test-helpers/create-logged-in-user';

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

  describe.only('when user logged in', () => {
    describe('when user with requested id exists', () => {
      let user;
      let user2;
      let requestLover;

      beforeAll(async () => {
        user = await createLoggedInUser({
          isInRelationship: false,
        });
        user2 = await createUser();
        const query = `mutation {
          requestLover(recipientId: "${user2.id}") {
            id, isAccepted, isSenderCanceled, isRecipientCanceled, createdAt,
            sender {
              id, email, username, firstName, lastName
            },
            recipient {
              id, email, username, firstName, lastName
            }
          }
        }`;
        const request = await graphql(schema, query, user.rootValue, sequelize);
        requestLover = request.data.requestLover;
      });

      it('should return loverRequest', async () => {
        const [loverRequest] = await LoverRequest.findAll({
          limit: 1,
          order: [['createdAt', 'DESC']],
        });
        expect(requestLover).toMatchObject({
          id: loverRequest.id,
          isAccepted: false,
          isSenderCanceled: false,
          isRecipientCanceled: false,
        });

        expect(requestLover.createdAt).toBeTruthy();
      });

      it('should return sender', () => {
        expect(requestLover.sender).toMatchObject({
          id: user.user.id,
          email: user.user.email,
          username: user.user.username,
          firstName: user.user.firstName,
          lastName: user.user.lastName,
        });
      });

      it('should return recipient', () => {
        expect(requestLover.recipient).toMatchObject({
          id: user2.id,
          email: user2.email,
          username: user2.username,
          firstName: user2.firstName,
          lastName: user2.lastName,
        });
      });
    });
  });
});
