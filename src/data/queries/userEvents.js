import { GraphQLObjectType, GraphQLInt, GraphQLList } from 'graphql';

import { User, UserEvent, LoveNoteEvent, LoveNote } from '../models';
import UserEventType from '../types/UserEventType';
import LoveNoteEventType from '../types/LoveNoteEventType';
import LoveNoteType from '../types/LoveNoteType';
import { UserNotLoggedInError } from '../errors';
import { validateJwtToken } from '../helpers';

const getLoveNotes = async userEvents => {
  const loveNoteUserEventIds = userEvents
    .filter(
      userEvent =>
        userEvent.name === 'lovenote-sent' ||
        userEvent.name === 'lovenote-received',
    )
    .map(userEvent => userEvent.id);
  const loveNoteEvents = await LoveNoteEvent.findAll({
    where: {
      userEventId: {
        $or: loveNoteUserEventIds,
      },
    },
  });
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

const userEvents = {
  type: new GraphQLObjectType({
    name: 'UserEventsResource',
    description:
      'Get a list of relevant user events for both you and your lover',
    fields: {
      rows: { type: new GraphQLList(UserEventType) },
      count: { type: GraphQLInt },
      limit: { type: GraphQLInt },
      offset: { type: GraphQLInt },
      loveNoteEvents: { type: new GraphQLList(LoveNoteEventType) },
      loveNotes: { type: new GraphQLList(LoveNoteType) },
    },
  }),
  args: {
    limit: { type: GraphQLInt },
    offset: { type: GraphQLInt },
  },
  resolve: async ({ request }, { limit, offset }) => {
    const verify = await validateJwtToken(request);

    if (verify) {
      const user = await User.find({ where: { id: verify.id } });

      const res = await UserEvent.findAndCountAll({
        limit,
        offset,
        where: {
          relationshipId: user.RelationshipId,
          userId: user.id,
        },
        order: [['createdAt', 'DESC']],
      });

      const { loveNotes, loveNoteEvents } = await getLoveNotes(res.rows);

      return {
        count: res.count,
        rows: res.rows,
        limit,
        offset,
        loveNotes,
        loveNoteEvents,
      };
    }

    throw UserNotLoggedInError;
  },
};

export default userEvents;
