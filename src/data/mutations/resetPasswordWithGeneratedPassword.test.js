import bcrypt from 'bcrypt';
import { graphql } from 'graphql';

import schema from '../schema';
import sequelize from '../sequelize';
import emailHelper from '../helpers/email';
import createLoggedInUser from '../test-helpers/create-logged-in-user';
import { UserPasswordReset } from '../models';

jest.mock('../helpers/email');

describe('resetPasswordWithGeneratedPassword', () => {
  let query = `mutation {
    resetPasswordWithGeneratedPassword(
      generatedPassword: "abc123"
      newPassword: "foobarbaz"
    ) { success }
  }`;

  describe('when user is not logged in', () => {
    it('should throw an error', async () => {
      const { errors } = await graphql(schema, query, {}, sequelize);
      expect(errors[0].message).toBe('User not logged in');
    });
  });

  describe('when user is logged in', () => {
    let loggedInUser;

    beforeAll(async () => {
      loggedInUser = await createLoggedInUser({ isInRelationship: false });
    });

    describe('when user reset password does not exist', () => {
      it('should throw an error', async () => {
        const res = await graphql(
          schema,
          query,
          loggedInUser.rootValue,
          sequelize,
        );
        expect(res.errors[0].message).toBe(
          'A system password does not exist for this user.',
        );
      });
    });

    describe('when user reset password exists', () => {
      beforeAll(async () => {
        const { user } = loggedInUser;
        const salt = await bcrypt.genSalt();
        const resetPassword = await bcrypt.hash('meowboxbaby', salt);
        await UserPasswordReset.create({
          userId: user.id,
          resetPassword,
          isUsed: true,
        });
      });

      describe('when generated password does not match', () => {
        it('should throw an error', async () => {
          const res = await graphql(
            schema,
            query,
            loggedInUser.rootValue,
            sequelize,
          );
          expect(res.errors[0].message).toBe(
            'System generated password invalid.',
          );
        });
      });

      describe('when generatedPassword does match', () => {
        let res;

        beforeAll(async () => {
          query = `mutation {
            resetPasswordWithGeneratedPassword(
              generatedPassword: "meowboxbaby"
              newPassword: "abc123xyz"
            ) { success }
          }`;
          res = await graphql(schema, query, loggedInUser.rootValue, sequelize);
          await loggedInUser.user.reload();
        });

        afterAll(() => {
          emailHelper.sendEmail.mockReset();
        });

        it('should change the users password', async () => {
          const { user } = loggedInUser;
          const isMatch = await bcrypt.compare('abc123xyz', user.password);
          expect(isMatch).toBe(true);
        });

        it('should send an email', () => {
          const { sendEmail: { mock: { calls } } } = emailHelper;
          expect(calls).toHaveLength(1);
          const call = calls[0][0];
          expect(call.to).toBe(loggedInUser.user.email);
          expect(call.subject).toBe('Your Luvup Password Has Been Changed');
        });

        it('should return success', () => {
          expect(res.errors).toBeFalsy();
          expect(res.data.resetPasswordWithGeneratedPassword.success).toBe(
            true,
          );
        });
      });
    });
  });
});
