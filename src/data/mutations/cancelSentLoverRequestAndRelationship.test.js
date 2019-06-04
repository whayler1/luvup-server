import { graphql } from 'graphql';
import isString from 'lodash/isString';

import schema from '../schema';
import sequelize from '../sequelize';
import createLoggedInUser, {
  createUser,
} from '../test-helpers/create-logged-in-user';
import { LoverRequest } from '../models';
import emailHelper from '../helpers/email';
import { trackCancelSentLoverRequestAndRelationship as tracking } from '../../services/analytics';

jest.mock('../helpers/email');
jest.mock(
  '../../services/analytics/trackCancelSentLoverRequestAndRelationship',
);

describe('cancelSentLoverRequestAndRelationship', () => {
  describe('when user is logged in', () => {
    let user;
    let res;

    beforeAll(async () => {
      const loggedInUser = await createLoggedInUser({
        isInRelationship: false,
      });
      user = loggedInUser.user;
      const rootValue = loggedInUser.rootValue;
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

    it('sends an email', () => {
      const {
        sendEmail: { mock: { calls: [[{ to, subject, html }]] } },
      } = emailHelper;
      expect(to).toEqual(expect.stringMatching(/^fake\+.*@gmail\.com$/));
      expect(subject).toBe('You canceled a lover request');
      expect(html).toEqual(expect.stringMatching(/^<p>.*<\/p>$/));
    });

    it('calls analytics', () => {
      const {
        data: {
          cancelSentLoverRequestAndRelationship: { loverRequest, relationship },
        },
      } = res;
      const {
        mock: { calls: [[userId, loverRequestId, relationshipId]] },
      } = tracking;
      expect(userId).toBe(user.id);
      expect(loverRequestId).toBe(loverRequest.id);
      expect(relationshipId).toBe(relationship.id);
    });
  });
});
