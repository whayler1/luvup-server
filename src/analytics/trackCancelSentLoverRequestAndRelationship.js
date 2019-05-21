import analytics from '../services/analytics';

const trackCancelSentLoverRequestAndRelationship = (
  userId,
  loverRequestId,
  relationshipId,
) =>
  analytics.track({
    userId,
    event: 'cancelSentLoverRequestAndRelationship',
    properties: {
      loverRequestId,
      relationshipId,
    },
  });

export default trackCancelSentLoverRequestAndRelationship;
