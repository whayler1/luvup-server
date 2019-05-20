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

    it('returns a cenceled lover request', () => {
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

    it('returns a canceled relationhip', () => {
      const {
        data: {
          cancelSentLoverRequestAndRelationship: {
            relationship: { id, createdAt, updatedAt, endDate, lovers },
          },
        },
      } = res;
      expect(isString(id)).toBe(true);
      expect(isString(createdAt)).toBe(true);
      expect(isString(updatedAt)).toBe(true);
      expect(isString(endDate)).toBe(true);
      expect(lovers).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            isPlaceholder: false,
          }),
          expect.objectContaining({
            isPlaceholder: true,
          }),
        ]),
      );
    });

    it('sends an email', () => {});

    it('calls analytics', () => {});
  });
});
