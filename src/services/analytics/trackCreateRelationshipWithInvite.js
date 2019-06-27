import analytics from './analytics';

const trackCreateRelationshipWithInvite = (
  userId,
  {
    loverRequestId,
    relationshipId,
    recipientEmail,
    recipientFirstName,
    recipientLastName,
    userInviteId,
  },
) =>
  analytics.track({
    userId,
    event: 'createRelationshipWithInvite',
    properties: {
      loverRequestId,
      relationshipId,
      recipientEmail,
      recipientFirstName,
      recipientLastName,
      userInviteId,
    },
  });

export default trackCreateRelationshipWithInvite;
