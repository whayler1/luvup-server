import { graphql } from 'graphql';
import sequelize from '../sequelize';
import schema from '../schema';
import { createLoggedInUser } from '../test-helpers';
import { UserEvent, LoveNoteEvent } from '../models';

const createLoveNoteRequest = async (numLuvups, numJalapenos) => {
  const { user, lover, rootValue } = await createLoggedInUser();
  let appendString = '';

  if (numLuvups) {
    appendString += ` numLuvups: ${numLuvups}`;
  }
  if (numJalapenos) {
    appendString += ` numJalapenos: ${numJalapenos}`;
  }
  const query = `mutation {
    createLoveNote(
      note: "meow meow"${appendString}
    ) {
      loveNote {
        id
        note
        createdAt
        updatedAt
        relationshipId
        senderId
        recipientId
        isRead
        numJalapenos
        numLuvups
        luvups { id }
        jalapenos { id }
      }
    }
  }`;
  const res = await graphql(schema, query, rootValue, sequelize);
  return { res, user, lover };
};

describe('createLoveNote', () => {
  let originalTimeout;

  beforeAll(async () => {
    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;
  });

  afterAll(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
  });

  describe('when user logged in', () => {
    it('should allow user to create a love note', async () => {
      const {
        user,
        lover,
        res: { data: { createLoveNote: { loveNote } } },
      } = await createLoveNoteRequest();

      expect(loveNote).toEqual(
        expect.objectContaining({
          note: 'meow meow',
          relationshipId: user.RelationshipId,
          senderId: user.id,
          recipientId: lover.id,
          isRead: false,
          numJalapenos: 0,
          numLuvups: 0,
          luvups: null,
          jalapenos: null,
        }),
      );
    });

    it('should allow user to append luvups', async () => {
      const {
        user,
        lover,
        res: { data: { createLoveNote: { loveNote } } },
      } = await createLoveNoteRequest(2);

      expect(loveNote).toEqual(
        expect.objectContaining({
          note: 'meow meow',
          relationshipId: user.RelationshipId,
          senderId: user.id,
          recipientId: lover.id,
          isRead: false,
          numJalapenos: 0,
          numLuvups: 2,
          jalapenos: null,
        }),
      );
      expect(loveNote.luvups).toHaveLength(2);
    });

    it('should allow user to append jalapenos', async () => {
      const {
        user,
        lover,
        res: { data: { createLoveNote: { loveNote } } },
      } = await createLoveNoteRequest(undefined, 2);

      expect(loveNote).toEqual(
        expect.objectContaining({
          note: 'meow meow',
          relationshipId: user.RelationshipId,
          senderId: user.id,
          recipientId: lover.id,
          isRead: false,
          numJalapenos: 2,
          numLuvups: 0,
          luvups: null,
        }),
      );
      expect(loveNote.jalapenos).toHaveLength(2);
    });

    it('should create User Events and Love Note Events', async () => {
      const {
        user,
        lover,
        res: { data: { createLoveNote: { loveNote } } },
      } = await createLoveNoteRequest();

      const userEvents = await UserEvent.findAll({
        where: {
          relationshipId: user.RelationshipId,
        },
      });

      expect(userEvents).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            userId: user.id,
            name: 'lovenote-sent',
          }),
          expect.objectContaining({
            userId: lover.id,
            name: 'lovenote-received',
          }),
        ]),
      );

      const loveNoteEvents = await LoveNoteEvent.findAll({
        where: {
          loveNoteId: loveNote.id,
        },
      });

      expect(loveNoteEvents).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            loveNoteId: loveNote.id,
            userEventId: userEvents[0].id,
          }),
          expect.objectContaining({
            loveNoteId: loveNote.id,
            userEventId: userEvents[1].id,
          }),
        ]),
      );
    });
  });
});
