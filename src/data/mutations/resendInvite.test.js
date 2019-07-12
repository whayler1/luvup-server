import { graphql } from 'graphql';

import sequelize from '../sequelize';
import schema from '../schema';
import createLoggedInUser from '../test-helpers/create-logged-in-user';
import { UserInvite } from '../models';

describe('resendInvite', () => {
  let res;

  beforeAll(async () => {
    const { user, rootValue } = await createLoggedInUser({
      isInRelationship: false,
    });
    const userInvite = await UserInvite.create({
      senderId: user.id,
      recipientEmail: 'original@email.com',
    });
    console.log('\n\n userInvite', userInvite);

    const query = `mutation {
      resendInvite(
        userInviteId: "${userInvite.id}"
        recipientEmail: "new@email.com"
      ) {}
    }`;

    res = await graphql(schema, query, rootValue, sequelize);
  });

  it('foo', async () => {
    console.log('\n\n res', res);
  });
});
