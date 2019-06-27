import isUUID from 'is-uuid';
import isString from 'lodash/isString';
import { graphql } from 'graphql';

import schema from '../schema';
import sequelize from '../sequelize';
import createLoggedInUser from '../test-helpers/create-logged-in-user';

describe('createRelationshipWithInvite', () => {
  // let user;
  let res;

  beforeAll(async () => {
    const loggedInUser = await createLoggedInUser({
      isInRelationship: false,
    });
    // user = loggedInUser.user;
    const rootValue = loggedInUser.rootValue;

    const query = `mutation {
      createRelationshipWithInvite(
        recipientEmail: "recipient@email.com"
        recipientFirstName: "Erlich"
        recipientLastName: "Bachman"
      ) {
        loverRequest {
          id isAccepted isSenderCanceled isRecipientCanceled createdAt
          recipient { id email isPlaceholder username firstName lastName }
        }
        relationship {
          id createdAt updatedAt endDate
          lovers { id email isPlaceholder username firstName lastName }
        }
        userInvite {
          id relationshipId senderId loverRequestId userRequestId recipientEmail recipientFirstName recipientLastName
        }
      }
    }`;
    res = await graphql(schema, query, rootValue, sequelize);
  });

  it('returns a loverRequest', () => {
    const {
      id,
      isAccepted,
      isSenderCanceled,
      isRecipientCanceled,
      createdAt,
      recipient,
    } = res.data.createRelationshipWithInvite.loverRequest;

    expect(isUUID.v1(id)).toBe(true);
    expect(isAccepted).toBe(false);
    expect(isSenderCanceled).toBe(false);
    expect(isRecipientCanceled).toBe(false);
    expect(isString(createdAt)).toBe(true);
    expect(recipient).toBeNull();
  });
});
