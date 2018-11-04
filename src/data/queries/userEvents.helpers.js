/* eslint-disable import/prefer-default-export */
import { LoveNoteEvent, LoveNote } from '../models';

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
        $or: loveNoteUserEventIds,
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
        $or: loveNoteIds,
      },
    },
  });

  return { loveNoteEvents, loveNotes };
};
