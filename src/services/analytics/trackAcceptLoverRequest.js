import analytics from './analytics';

const trackAcceptLoverRequest = (userId, senderId, loverRequestId) =>
  analytics.track({
    userId,
    event: 'acceptLoverRequest',
    properties: {
      category: 'loverRequest',
      loverRequestId,
      senderId,
    },
  });

export default trackAcceptLoverRequest;
