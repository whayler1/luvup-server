import { graphql } from 'graphql';

import sequelize from '../sequelize';
import schema from '../schema';
import createLoggedInUser from '../test-helpers/create-logged-in-user';
import { UserInvite } from '../models';
import sendInviteRecipientEmail from '../../emails/sendInviteRecipientEmail';

jest.mock('../../emails/sendInviteRecipientEmail');

describe('resendInvite', () => {
  let user;
  let userInvite;
  let res;

  beforeAll(async () => {
    const loggedInUser = await createLoggedInUser({
      isInRelationship: false,
    });
    user = loggedInUser.user;
    const rootValue = loggedInUser.rootValue;
    userInvite = await UserInvite.create({
      senderId: user.id,
      recipientEmail: 'original@email.com',
      recipientFirstName: 'Pat',
      recipientLastName: 'Renolds',
    });

    const query = `mutation {
      resendInvite(
        userInviteId: "${userInvite.id}"
        recipientEmail: "new@email.com"
      ) {
        userInvite { id }
      }
    }`;

    res = await graphql(schema, query, rootValue, sequelize);
  });

  it('should send invite recipient email', () => {
    const call = sendInviteRecipientEmail.mock.calls[0][0];
    expect(call.sender.dataValues).toMatchObject(user.dataValues);
    expect(call.recipientEmail).toBe('new@email.com');
    expect(call.recipientFirstName).toBe('Pat');
    expect(call.recipientLastName).toBe('Renolds');
    expect(call.userInviteId).toBe(userInvite.id);
  });

  it('should return user invite id', async () => {
    expect(res.data.resendInvite.userInvite.id).toBe(userInvite.id);
  });
});
