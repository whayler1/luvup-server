import analytics from './analytics';

const trackResendInvite = (userId, userInviteId, recipientEmail) =>
  analytics.track({
    userId,
    event: 'resendInvite',
    properties: {
      category: 'userInvite',
      userInviteId,
      recipientEmail,
    },
  });

export default trackResendInvite;
