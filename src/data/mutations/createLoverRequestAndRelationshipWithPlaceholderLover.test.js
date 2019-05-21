import { graphql } from 'graphql';
// import isString from 'lodash/isString';

import schema from '../schema';
import sequelize from '../sequelize';
import createLoggedInUser, {
  createUser,
} from '../test-helpers/create-logged-in-user';

describe('createLoverRequestAndRelationshipWithPlaceholderLover', () => {
  let user;
  let res;

  beforeAll(async () => {
    const loggedInUser = await createLoggedInUser({
      isInRelationship: false,
    });
    user = loggedInUser.user;
    const rootValue = loggedInUser.rootValue;
    const recipient = await createUser();

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

  it('flubba', () => {
    console.log('res', res.data);
  });
});
