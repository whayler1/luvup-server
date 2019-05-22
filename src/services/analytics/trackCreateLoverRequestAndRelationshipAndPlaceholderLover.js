import analytics from './analytics';

const trackCreateLoverRequestAndRelationshipAndPlaceholderLover = (
  userId,
  recipientId,
  loverRequestId,
  relationshipId,
) =>
  analytics.track({
    userId,
    event: 'createLoverRequestAndRelationshipAndPlaceholderLover',
    properties: {
      recipientId,
      loverRequestId,
      relationshipId,
    },
  });

export default trackCreateLoverRequestAndRelationshipAndPlaceholderLover;
