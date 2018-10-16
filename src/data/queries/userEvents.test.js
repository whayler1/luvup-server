import { graphql } from 'graphql';
import sequelize from '../sequelize';
import schema from '../schema';
import { createLoggedInUser, modelsSync } from '../test-helpers';
import { UserEvent, LoveNote, LoveNoteEvent } from '../models';
import { UserNotLoggedInError } from '../errors';

const getSuccessfulQuery = async offset => {
  const { user, lover, rootValue } = await createLoggedInUser();
  const eventNames = ['coin-received', 'lovenote-sent', 'quiz-item-sent'];
  const userEvents = await UserEvent.bulkCreate(
    eventNames.map((name, i) => ({
      userId: user.id,
      relationshipId: user.RelationshipId,
      createdAt: new Date(`2018-01-0${i + 1}`),
      updatedAt: new Date(`2018-01-0${i + 1}`),
      name,
    })),
  );
  const loveNote = await LoveNote.create({
    senderId: user.id,
    recipientId: lover.id,
    relationshipId: user.RelationshipId,
    note: 'foo baby',
    numLuvups: 0,
    numJalapenos: 0,
  });
  const loveNoteUserEvent = userEvents.find(
    userEvent => userEvent.name === 'lovenote-sent',
  );
  await LoveNoteEvent.create({
    loveNoteId: loveNote.id,
    userEventId: loveNoteUserEvent.id,
  });
  // await LoveNoteEvent.bulkCreate(userEvents.map((userEvent) =>));
  const offsetStr = offset ? `offset: ${offset}` : '';
  const query = `{
    userEvents(
      limit: 2 ${offsetStr}
    ) {
      rows { id name }
      count
      limit
      offset
      loveNotes { id note }
      loveNoteEvents { id userEventId loveNoteId }
    }
  }`;
  const res = await graphql(schema, query, rootValue, sequelize);
  return { user, res };
};

describe('userEvents', () => {
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
    it('should return user events starting with most recent', async () => {
      const {
        res: { data: { userEvents: { rows, count, limit, offset } } },
      } = await getSuccessfulQuery();

      expect(rows).toHaveLength(2);
      expect(count).toEqual(3);
      expect(rows[0]).toEqual(
        expect.objectContaining({
          name: 'quiz-item-sent',
        }),
      );
      expect(rows[1]).toEqual(
        expect.objectContaining({
          name: 'lovenote-sent',
        }),
      );
      expect(limit).toEqual(2);
      expect(offset).toBeNull();
    });

    it('should offset properly', async () => {
      const {
        res: { data: { userEvents: { rows, count } } },
      } = await getSuccessfulQuery(1);

      expect(rows).toHaveLength(2);
      expect(count).toEqual(3);
      expect(rows[0]).toEqual(
        expect.objectContaining({
          name: 'lovenote-sent',
        }),
      );
      expect(rows[1]).toEqual(
        expect.objectContaining({
          name: 'coin-received',
        }),
      );
    });

    it('should return associated loveNoteEvents and loveNotes', async () => {
      const {
        res: { data: { userEvents: { rows, loveNotes, loveNoteEvents } } },
      } = await getSuccessfulQuery();

      expect(loveNotes).toHaveLength(1);
      expect(loveNoteEvents).toHaveLength(1);
      expect(loveNotes[0].note).toEqual('foo baby');
      expect(loveNoteEvents[0]).toEqual(
        expect.objectContaining({
          userEventId: rows[1].id,
          loveNoteId: loveNotes[0].id,
        }),
      );
    });
  });

  describe('when user is not logged in', () => {
    it('should throw an error', async () => {
      const query = `{
        userEvents {
          rows { id }
        }
      }`;

      const { errors } = await graphql(schema, query, {}, sequelize);
      expect(errors[0].message).toBe(UserNotLoggedInError.message);
    });
  });
});
