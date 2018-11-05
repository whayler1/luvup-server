import { graphql } from 'graphql';
import _ from 'lodash';
import sequelize from '../sequelize';
import schema from '../schema';
import { createQuizItem } from '../helpers';
import { createLoggedInUser, modelsSync } from '../test-helpers';
import { UserEvent, LoveNote, LoveNoteEvent, QuizItemEvent } from '../models';
import { UserNotLoggedInError } from '../errors';

const getSuccessfulQueryWithQuizItems = async () => {
  const { user, lover, rootValue } = await createLoggedInUser();
  const eventNames = [
    'coin-received',
    'lovenote-sent',
    'quiz-item-sent',
    'quiz-item-received',
    'quiz-item-sent-answered',
    'quiz-item-received-answered',
  ];
  const [
    ,
    ,
    quizItemSentEvent,
    quizItemReceivedEvent,
    quizItemSentAnsweredEvent,
    quizItemReceivedAnsweredEvent,
  ] = await UserEvent.bulkCreate(
    eventNames.map((name, i) => ({
      userId: user.id,
      relationshipId: user.RelationshipId,
      createdAt: new Date(`2018-01-0${i + 1}`),
      updatedAt: new Date(`2018-01-0${i + 1}`),
      name,
    })),
  );

  const [sentQuizItem, receivedQuizItem] = await Promise.all([
    createQuizItem(
      user,
      lover,
      'I am the users question',
      2,
      ['a', 'b', 'c'],
      1,
    ),
    createQuizItem(
      lover,
      user,
      'I am the lovers question',
      2,
      ['d', 'e', 'f'],
      1,
    ),
  ]);

  const quizItemEvents = await QuizItemEvent.bulkCreate([
    {
      quizItemId: sentQuizItem.id,
      userEventId: quizItemSentEvent.id,
    },
    {
      quizItemId: receivedQuizItem.id,
      userEventId: quizItemReceivedEvent.id,
    },
    {
      quizItemId: receivedQuizItem.id,
      userEventId: quizItemSentAnsweredEvent.id,
    },
    {
      quizItemId: sentQuizItem.id,
      userEventId: quizItemReceivedAnsweredEvent.id,
    },
  ]);
  console.log('\n\n --- userEvents test ----\nquizItemEvents', quizItemEvents);
  const query = `{
    userEvents(
      limit: 5
    ) {
      count
      quizItemEvents { quizItemId userEventId }
      quizItems {
        senderId
        recipientId
        question
        reward
        choices {
          answer
        }
      }
    }
  }`;
  const res = await graphql(schema, query, rootValue, sequelize);
  return { user, res };
};

const getSuccessfulQueryWithLoveNotes = async offset => {
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
      } = await getSuccessfulQueryWithLoveNotes();

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
      } = await getSuccessfulQueryWithLoveNotes(1);

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
      } = await getSuccessfulQueryWithLoveNotes();

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

    it('should not return love notes is there are no love note events', async () => {
      const { user, lover, rootValue } = await createLoggedInUser();
      const eventNames = ['coin-received', 'lovenote-sent', 'quiz-item-sent'];
      const userEventPromise = UserEvent.bulkCreate(
        eventNames.map((name, i) => ({
          userId: user.id,
          relationshipId: user.RelationshipId,
          createdAt: new Date(`2018-01-0${i + 1}`),
          updatedAt: new Date(`2018-01-0${i + 1}`),
          name,
        })),
      );
      const loveNotePromise = LoveNote.bulkCreate(
        _.times(2, () => ({
          relationshipId: user.RelationshipId,
          senderId: lover.id,
          recipientId: user.id,
          note: 'a',
        })),
      );

      await Promise.all([userEventPromise, loveNotePromise]);

      const query = `{
        userEvents(
          limit: 2
        ) {
          rows { id name }
          count
          limit
          offset
          loveNotes { id note }
          loveNoteEvents { id userEventId loveNoteId }
        }
      }`;

      const {
        data: { userEvents: { count, rows, loveNotes, loveNoteEvents } },
      } = await graphql(schema, query, rootValue, sequelize);
      expect(count).toBe(3);
      expect(rows).toHaveLength(2);
      expect(loveNoteEvents).toHaveLength(0);
      expect(loveNotes).toHaveLength(0);
    });
  });

  it.only('should return quiz items', async () => {
    const { res } = await getSuccessfulQueryWithQuizItems();
    console.log('\n\n ---- res ---\n', res);
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
