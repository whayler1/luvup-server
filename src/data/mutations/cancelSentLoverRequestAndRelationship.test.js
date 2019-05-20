import { graphql } from 'graphql';
import isString from 'lodash/isString';

import schema from '../schema';
import sequelize from '../sequelize';
import createLoggedInUser, {
  createUser,
} from '../test-helpers/create-logged-in-user';
import { LoverRequest } from '../models';

describe('cancelSentLoverRequestAndRelationship', () => {
  describe('when user is logged in', () => {
    let res;
    beforeAll(async () => {
      const { user, rootValue } = await createLoggedInUser({
        isInRelationship: false,
      });
      const recipient = await createUser();
      await LoverRequest.createAndAddRelationshipAndPlaceholderLover(
        user.id,
        recipient.id,
      );
      const query = `mutation {
        cancelSentLoverRequestAndRelationship {
          loverRequest {
            id isAccepted isSenderCanceled isRecipientCanceled createdAt
          }
          relationship {
            id createdAt updatedAt endDate
            lovers { id email isPlaceholder username firstName lastName }
          }
        }
      }`;
      res = await graphql(schema, query, rootValue, sequelize);
    });

    it('should return a cenceled lover request', () => {
      const {
        data: {
          cancelSentLoverRequestAndRelationship: {
            loverRequest: {
              id,
              isAccepted,
              isSenderCanceled,
              isRecipientCanceled,
              createdAt,
            },
          },
        },
      } = res;
      expect(isString(id)).toBe(true);
      expect(isAccepted).toBe(false);
      expect(isSenderCanceled).toBe(true);
      expect(isRecipientCanceled).toBe(false);
      expect(isString(createdAt)).toBe(true);
    });

    it('should return a cenceled relationhip', () => {});
    it('should send an email', () => {});
    it('should call analytics', () => {});
  });
});
