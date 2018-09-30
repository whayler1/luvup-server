import { GraphQLObjectType, GraphQLID, GraphQLNonNull } from 'graphql';

import QuizItemType from '../types/QuizItemType';
import { QuizItem } from '../models';
import { UserNotLoggedInError, PermissionError } from '../errors';
import { validateJwtToken, getUser } from '../helpers';
import analytics from '../../services/analytics';

const trackEvent = (userId, loverId, relationshipId) => {
  analytics.track({
    userId,
    event: 'archiveQuizItem',
    properties: {
      category: 'quizItem',
      recipientId: loverId,
      relationshipId,
    },
  });
};

const archiveQuizItem = {
  type: new GraphQLObjectType({
    name: 'ArchiveQuizItem',
    description: 'sets isArchived to true',
    fields: {
      quizItem: { type: QuizItemType },
    },
  }),
  args: {
    quizItemId: { type: new GraphQLNonNull(GraphQLID) },
  },
  resolve: async ({ request }, { quizItemId }) => {
    const verify = await validateJwtToken(request);

    if (verify) {
      const { user, lover } = await getUser(verify.id);
      let quizItem = await QuizItem.findOne({ where: { id: quizItemId } });

      if (quizItem.senderId === user.id) {
        quizItem = await quizItem.update({ isArchived: true });
        trackEvent(user.id, lover.id, user.RelationshipId);
        return { quizItem };
      }
      throw PermissionError;
    }
    throw UserNotLoggedInError;
  },
};

export default archiveQuizItem;
