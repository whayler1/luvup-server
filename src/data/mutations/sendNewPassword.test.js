import { graphql } from 'graphql';
import schema from '../schema';
import sequelize from '../sequelize';

import { UserPasswordReset } from '../models';
import { createUser } from '../test-helpers/create-logged-in-user';
import emailHelper from '../helpers/email';

jest.mock('../helpers/email');

describe('sendNewPassword', () => {
  afterAll(() => {
    /* eslint-disable import/no-named-as-default-member */
    emailHelper.sendEmail.mockReset();
    /* eslint-enable import/no-named-as-default-member */
  });

  describe('when user exists', () => {
    let user;
    let userPasswordResetCount;
    let res;

    beforeAll(async () => {
      userPasswordResetCount = await UserPasswordReset.count();
      user = await createUser();
      const query = `mutation { sendNewPassword(email:"${user.email}") { success } }`;
      res = await graphql(schema, query, {}, sequelize);
    });

    it('should create new user password reset', async () => {
      const newUserPasswordResetCount = await UserPasswordReset.count();
      expect(newUserPasswordResetCount).toBe(userPasswordResetCount + 1);
      const userPasswordReset = await UserPasswordReset.findOne({
        where: {
          userId: user.id,
        },
      });
      expect(userPasswordReset.isUsed).toBe(false);
    });

    it('should send email', () => {
      const { calls } = emailHelper.sendEmail.mock;
      const call = calls[0][0];
      expect(calls).toHaveLength(1);
      expect(call.to).toBe(user.email);
      expect(call.subject).toBe('Luvup Password Reset');
      expect(call.html).toContain('Your temporary password is');
    });

    it('should respond with success', () => {
      expect(res.data.sendNewPassword.success).toBe(true);
    });
  });

  describe('when user does not exist', () => {
    let res;

    beforeAll(async () => {
      const query = `mutation { sendNewPassword(email:"meow@fakeuser.net") { success } }`;
      res = await graphql(schema, query, {}, sequelize);
    });

    it('should return an error', () => {
      expect(res.errors[0].message).toBe('No user found with that email');
    });
  });
});
