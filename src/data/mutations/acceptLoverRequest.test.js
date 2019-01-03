import { graphql } from 'graphql';
import schema from '../schema';
import sequelize from '../sequelize';
import { Relationship } from '../models';
import { UserNotLoggedInError, LoverRequestNotFoundError } from '../errors';
import createLoggedInUser, {
  createUser,
} from '../test-helpers/create-logged-in-user';
import analytics from '../../services/analytics';

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
      const originalAnalyticsTrack = analytics.track;
      let user;
      let user2;
      let request;
      let user2LoverRequest;

      beforeEach(async () => {
        analytics.track = jest.fn();

        const loggedInUser = await createLoggedInUser({
          isInRelationship: false,
        });

        user = loggedInUser.user;

        user2 = await createUser();
        user2LoverRequest = await user2.createLoverRequest({
          recipientId: user.id,
        });

        const query = `mutation {
          acceptLoverRequest(
            loverRequestId: "${user2LoverRequest.id}"
          ) {
            loverRequest {
              id
              isAccepted
              isSenderCanceled
              isRecipientCanceled
            }
          }
        }`;

        request = await graphql(
          schema,
          query,
          loggedInUser.rootValue,
          sequelize,
        );
      });

      afterAll(() => {
        analytics.track = originalAnalyticsTrack;
      });

      it('should return accepted lover request object', async () => {
        const { data: { acceptLoverRequest: { loverRequest } } } = request;

        expect(loverRequest.id).toBe(user2LoverRequest.id);
        expect(loverRequest.isAccepted).toBe(true);
        expect(loverRequest.isSenderCanceled).toBe(false);
        expect(loverRequest.isRecipientCanceled).toBe(false);
      });

      it('should set user and lovers relationship', async () => {
        await user.reload();
        await user2.reload();
        const [relationship] = await Relationship.findAll({
          limit: 1,
          order: [['createdAt', 'DESC']],
        });

        expect(user.RelationshipId).toBe(relationship.id);
        expect(user2.RelationshipId).toBe(relationship.id);
      });

      it('should add lover ids to relationship', async () => {
        const [relationship] = await Relationship.findAll({
          limit: 1,
          order: [['createdAt', 'DESC']],
        });

        const lovers = await relationship.getLover();

        expect(lovers[0].id).toBe(user.id);
        expect(lovers[1].id).toBe(user2.id);
        expect(lovers).toHaveLength(2);
      });

      it('should call analytics track', async () => {
        const { calls } = analytics.track.mock;
        const { data: { acceptLoverRequest: { loverRequest } } } = request;

        expect(calls).toHaveLength(1);
        expect(calls[0][0]).toEqual(
          expect.objectContaining({
            userId: user.id,
            event: 'acceptLoverRequest',
            properties: expect.objectContaining({
              category: 'loverRequest',
              loverRequestId: loverRequest.id,
              senderId: user2.id,
            }),
          }),
        );
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
