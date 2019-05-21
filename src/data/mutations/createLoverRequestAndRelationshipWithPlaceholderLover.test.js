import { graphql } from 'graphql';
import isString from 'lodash/isString';
import isNull from 'lodash/isNull';

import schema from '../schema';
import sequelize from '../sequelize';
import createLoggedInUser, {
  createUser,
} from '../test-helpers/create-logged-in-user';

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
    console.log(
      'res',
      res.data.createLoverRequestAndRelationshipWithPlaceholderLover
        .relationship.lovers,
    );
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

  it('sends push updates', () => {});
  it('sends emails', () => {});
  it('sends analytics', () => {});
});
