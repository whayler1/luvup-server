import { createLoggedInUser } from '../test-helpers';

describe('userEvents', () => {
  describe('when user is logged in', () => {
    it('should return user events', async () => {
      const { user } = createLoggedInUser();
      console.log('user', user);
    });
  });
});
