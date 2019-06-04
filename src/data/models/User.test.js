import isString from 'lodash/isString';

import User from './User';

describe('User', () => {
  describe('createPlaceholderUserFromUser', () => {
    let user;
    let placeholderUser;

    beforeAll(async () => {
      user = await User.createSkipUserRequest();
      placeholderUser = await User.createPlaceholderUserFromUser(user.id);
    });

    it('creates placeholder user', () => {
      const {
        emailConfirmed,
        id,
        email,
        isPlaceholder,
        username,
        firstName,
        lastName,
        fullName,
        password,
        updatedAt,
        createdAt,
      } = placeholderUser;

      expect(emailConfirmed).toBe(false);
      expect(isString(id)).toBe(true);
      expect(email).toBe(user.email);
      expect(isPlaceholder).toBe(true);
      expect(isString(username)).toBe(true);
      expect(firstName).toBe(user.firstName);
      expect(lastName).toBe(user.lastName);
      expect(fullName).toBe(user.fullName);
      expect(isString(password)).toBe(true);
      expect(updatedAt).toBeInstanceOf(Date);
      expect(createdAt).toBeInstanceOf(Date);
    });
  });
});
