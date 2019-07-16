import { graphql } from 'graphql';
import sequelize from '../sequelize';
import schema from '../schema';

import { User, LoverRequest, UserInvite } from '../models';

describe('userInviteWithId', () => {
  describe('when user invite exists', () => {
    let sender;
    let userInvite;
    let loverRequest;
    let res;

    beforeAll(async () => {
      sender = await User.createSkipUserRequest();
      loverRequest = await LoverRequest.create({
        UserId: sender.id,
      });
      userInvite = await UserInvite.create({
        senderId: sender.id,
        loverRequestId: loverRequest.id,
        recipientEmail: 'fake@user.com',
        recipientFirstName: 'Bob',
        recipientLastName: 'Menedez',
      });

      const query = `{
        userInviteWithId(userInviteId: "${userInvite.id}") {
          userInvite { id senderId recipientEmail recipientFirstName recipientLastName }
          sender { id email isPlaceholder username firstName lastName }
          loverRequest { id isAccepted isSenderCanceled isRecipientCanceled }
        }
      }`;

      res = await graphql(schema, query, {}, sequelize);
    });

    it('returns a user invite', () => {
      expect(res.data.userInviteWithId.userInvite).toMatchObject({
        id: userInvite.id,
        senderId: sender.id,
        recipientEmail: 'fake@user.com',
        recipientFirstName: 'Bob',
        recipientLastName: 'Menedez',
      });
    });

    it('returns a sender', () => {
      expect(res.data.userInviteWithId.sender).toMatchObject({
        id: sender.id,
        email: sender.email,
        isPlaceholder: false,
        username: sender.username,
        firstName: 'Jane',
        lastName: 'Doe',
      });
    });

    it('returns a loverRequest', () => {
      expect(res.data.userInviteWithId.loverRequest).toMatchObject({
        id: loverRequest.id,
        isAccepted: false,
        isSenderCanceled: false,
        isRecipientCanceled: false,
      });
    });
  });
});
