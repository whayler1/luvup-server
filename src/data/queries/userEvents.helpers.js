/* eslint-disable import/prefer-default-export */
import _ from 'lodash';
import { LoveNoteEvent, LoveNote, QuizItem, QuizItemEvent } from '../models';
import { appendChoicesToQuizItems } from '../helpers/getQuizItemsWithChoices';

const quizItemEventNames = [
  'quiz-item-sent',
  'quiz-item-received',
  'quiz-item-sent-answered',
  'quiz-item-received-answered',
];

export const getQuizItems = async userEvents => {
  const quizItemEventIds = userEvents
    .filter(userEvent => quizItemEventNames.includes(userEvent.name))
    .map(userEvent => userEvent.id);

  if (quizItemEventIds.length < 1) {
    return { quizItemEvents: [], quizItems: [] };
  }

  const quizItemEvents = await QuizItemEvent.findAll({
    where: {
      userEventId: {
        $or: _.uniq(quizItemEventIds),
      },
    },
  });

  if (quizItemEvents.length < 1) {
    return { quizItemEvents, quizItems: [] };
  }

  const quizItemIds = quizItemEvents.map(
    quizItemEvent => quizItemEvent.quizItemId,
  );

  const quizItemsWithoutChoices = await QuizItem.findAll({
    where: {
      id: {
        $or: _.uniq(quizItemIds),
      },
    },
  });

  const quizItems = await appendChoicesToQuizItems(quizItemsWithoutChoices);

  return { quizItemEvents, quizItems };
};

export const getLoveNotes = async userEvents => {
  const loveNoteUserEventIds = userEvents
    .filter(
      userEvent =>
        userEvent.name === 'lovenote-sent' ||
        userEvent.name === 'lovenote-received',
    )
    .map(userEvent => userEvent.id);

  if (loveNoteUserEventIds.length < 1) {
    return { loveNoteEvents: [], loveNotes: [] };
  }

  const loveNoteEvents = await LoveNoteEvent.findAll({
    where: {
      userEventId: {
        $or: _.uniq(loveNoteUserEventIds),
      },
    },
  });

  if (loveNoteEvents.length < 1) {
    return { loveNoteEvents, loveNotes: [] };
  }

  const loveNoteIds = loveNoteEvents.map(
    loveNoteEvent => loveNoteEvent.loveNoteId,
  );
  const loveNotes = await LoveNote.findAll({
    where: {
      id: {
        $or: _.uniq(loveNoteIds),
      },
    },
  });

  return { loveNoteEvents, loveNotes };
};
