import { graphql } from 'graphql';
import uuidv1 from 'uuid/v1';
import sequelize from '../sequelize';
import schema from '../schema';
import { createLoggedInUser, modelsSync } from '../test-helpers';
import { LoveNote } from '../models';
import { UserNotLoggedInError, LoveNoteNotFoundError } from '../errors';

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

  describe('when user is logged in', () => {
    it('should throw an error isf there is no love note with that id', async () => {
      const { rootValue } = await createLoggedInUser();
      const query = `mutation {
        setLoveNoteRead(
          loveNoteId: "abc123"
        ) {
          loveNote { id }
        }
       }`;

      const { errors } = await graphql(schema, query, rootValue, sequelize);
      expect(errors[0].message).toBe(LoveNoteNotFoundError.message);
    });

    it('should throw an error if love note id matches, but recipient id is not user id', async () => {
      const randomUser = await createLoggedInUser();
      const { user, lover, rootValue } = await createLoggedInUser();
      const uuid = uuidv1();
      const query = `mutation {
        setLoveNoteRead(
          loveNoteId: "${uuid}"
        ) {
          loveNote { id }
        }
       }`;
      await LoveNote.create({
        id: uuid,
        note: 'a',
        relationshipId: user.RelationshipId,
        senderId: lover.id,
        recipientId: randomUser.user.id,
        numLuvups: 0,
        numJalapenos: 0,
      });

      const { errors } = await graphql(schema, query, rootValue, sequelize);
      expect(errors[0].message).toBe(LoveNoteNotFoundError.message);
    });
  });

  describe('when loveNoteId arg not provided', () => {
    it('should return required args error', async () => {
      const query = `mutation {
        setLoveNoteRead {
          loveNote { id }
        }
      }`;

      const result = await graphql(schema, query, {}, sequelize);

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toEqual(
        expect.objectContaining({
          message:
            'Field "setLoveNoteRead" argument "loveNoteId" of type "ID!" is required but not provided.',
        }),
      );
    });
  });

  describe('when user not logged in', () => {
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
