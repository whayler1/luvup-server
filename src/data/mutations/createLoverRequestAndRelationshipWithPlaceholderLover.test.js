import { graphql } from 'graphql';
import isString from 'lodash/isString';
import isNull from 'lodash/isNull';

import schema from '../schema';
import sequelize from '../sequelize';
import createLoggedInUser, {
  createUser,
} from '../test-helpers/create-logged-in-user';
import { sendPushNotification } from '../../services/pushNotifications';
import emailHelper from '../helpers/email';

jest.mock('../../services/pushNotifications/sendPushNotification');
jest.mock('../helpers/email');

describe('createLoverRequestAndRelationshipWithPlaceholderLover', () => {
  let user;
  let recipient;
  let res;

  beforeAll(async () => {
    const loggedInUser = await createLoggedInUser({
      isInRelationship: false,
    });
    user = loggedInUser.user;
    const rootValue = loggedInUser.rootValue;
    recipient = await createUser();

    const query = `mutation {
      createLoverRequestAndRelationshipWithPlaceholderLover(
        recipientId: "${recipient.id}"
      ) {
        loverRequest {
          id isAccepted isSenderCanceled isRecipientCanceled createdAt
          recipient { id email isPlaceholder username firstName lastName }
        }
        relationship {
          id createdAt updatedAt endDate
          lovers { id email isPlaceholder username firstName lastName }
        }
      }
    }`;
    res = await graphql(schema, query, rootValue, sequelize);
  });

  it('returns lover request', () => {
    const {
      data: {
        createLoverRequestAndRelationshipWithPlaceholderLover: {
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
    expect(isSenderCanceled).toBe(false);
    expect(isRecipientCanceled).toBe(false);
    expect(isString(createdAt)).toBe(true);
  });

  it('returns relationship', () => {
    const {
      data: {
        createLoverRequestAndRelationshipWithPlaceholderLover: {
          relationship: { id, createdAt, updatedAt, endDate },
        },
      },
    } = res;
    expect(isString(id)).toBe(true);
    expect(isString(createdAt)).toBe(true);
    expect(isString(updatedAt)).toBe(true);
    expect(isNull(endDate)).toBe(true);
  });

  it('returns placeholderLover', () => {
    const {
      data: {
        createLoverRequestAndRelationshipWithPlaceholderLover: {
          relationship: {
            lovers: [
              { id, email, isPlaceholder, username, firstName, lastName },
            ],
          },
        },
      },
    } = res;
    expect(isString(id)).toBe(true);
    expect(email).toBe(recipient.email);
    expect(isPlaceholder).toBe(true);
    expect(isString(username)).toBe(true);
    expect(firstName).toBe(recipient.firstName);
    expect(lastName).toBe(recipient.lastName);
  });

  it('sends push updates', () => {
    expect(sendPushNotification.mock.calls[0]).toEqual(
      expect.arrayContaining([
        recipient.id,
        'Jason Wents sent you a lover request! 💞',
        expect.objectContaining({
          type: 'lover-request-received',
        }),
      ]),
    );
  });

  it('sends emails', () => {
    const { sendEmail: { mock: { calls } } } = emailHelper;
    expect(calls[0][0]).toEqual(
      expect.objectContaining({
        to: user.email,
        subject: `You sent lover request to ${recipient.email}!`,
        html: `<p>Hi Jason,</p><p>You sent a lover request to Jason Wents at ${recipient.email}</p>`,
      }),
    );
    expect(calls[1][0]).toEqual(
      expect.objectContaining({
        to: recipient.email,
        subject: 'You received a lover request from Jason Wents on Luvup!',
        html: `<p>Hi Jason,</p><p>You received a lover request from Jason Wents (${user.email}) on Luvup! Log in to Luvup to accept or deny your new lover request.</p>`,
      }),
    );
  });

  it('sends analytics', () => {});
});
