import { GraphQLObjectType } from 'graphql';

import LoverRequestType from '../types/LoverRequestType';
import RelationshipType from '../types/RelationshipType';
import { validateJwtToken } from '../helpers';
import { UserNotLoggedInError } from '../errors';
import { LoverRequest, User, Relationship } from '../models';
import emailHelper from '../helpers/email';

const NoLoverRequestSentError = new Error(
  'You do not have any sent lover requests',
);

const endRelationship = async relationshipId => {
  const relationhip = Relationship.find({
    where: {
      id: relationshipId,
    },
  });
  const lovers = await relationhip.getLover();
  const updateRemoveLoverRelationshipId = lovers.map(lover =>
    lover.update({
      RelationshipId: null,
    }),
  );
  const updateRelationshipEndDate = relationhip.update({
    endDate: new Date(),
  });
  return Promise.all([
    updateRelationshipEndDate,
    ...updateRemoveLoverRelationshipId,
  ]);
};

const cancelLoverRequest = async senderId => {
  const loverRequest = await LoverRequest.find({
    where: {
      senderId,
      isAccepted: false,
      isSenderCanceled: false,
      isRecipientCanceled: false,
    },
  });

  if (!loverRequest) {
    throw NoLoverRequestSentError;
  }

  await loverRequest.update({ isSenderCanceled: true });
  await loverRequest.reload();
  return loverRequest;
};

const getRecipientFromLovers = (recipientId, lovers) =>
  lovers.find(lover => lover.id === recipientId);

const sendLoverRequestCanceledEmail = (user, recipient) => {
  emailHelper.sendEmail({
    to: user.email,
    subject: 'You canceled a lover request',
    html: `<p>Hi ${user.firstName},</p><p>You canceled a lover request you sent to ${recipient.email}</p>`,
  });
};

const cancelSentLoverRequestAndRelationship = {
  type: new GraphQLObjectType({
    name: 'CancelSentLoverRequestAndRelationship',
    fields: {
      loverRequest: { type: LoverRequestType },
      relationship: { type: RelationshipType },
    },
  }),
  resolve: async ({ request }) => {
    const verify = await validateJwtToken(request);

    if (!verify) {
      throw UserNotLoggedInError;
    }

    const loverRequest = await cancelLoverRequest(verify.id);
    const user = await User.find({ where: { id: verify.id } });
    const [relationhip, ...lovers] = await endRelationship(user.RelationshipId);
    sendLoverRequestCanceledEmail(
      user,
      getRecipientFromLovers(loverRequest.recipientId, lovers),
    );

    return {
      loverRequest,
      relationhip,
    };
  },
};

export default cancelSentLoverRequestAndRelationship;
