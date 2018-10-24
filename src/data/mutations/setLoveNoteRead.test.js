import { graphql } from 'graphql';
import sequelize from '../sequelize';
import schema from '../schema';
import { /* createLoggedInUser,*/ modelsSync } from '../test-helpers';
// import { UserEvent, LoveNoteEvent } from '../models';
import { UserNotLoggedInError } from '../errors';

describe('setLoveNoteRead', () => {
  let originalTimeout;

  beforeAll(async () => {
    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;
    await modelsSync;
  });

  afterAll(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
  });

  describe('when user note logged in', () => {
    it('should return an error', async () => {
      const query = `mutation {
        setLoveNoteRead(
          loveNoteId: "abc123"
        ) {
          loveNote { id }
        }
      }`;

      const { errors } = await graphql(schema, query, {}, sequelize);
      expect(errors[0].message).toBe(UserNotLoggedInError.message);
    });
  });
});
