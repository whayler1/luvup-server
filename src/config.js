/* eslint-disable max-len */

if (process.env.BROWSER) {
  throw new Error(
    'Do not import `config.js` from inside the client-side code.',
  );
}

module.exports = {
  // Node.js app
  port: process.env.PORT || 3000,

  // API Gateway
  api: {
    // API URL to be used in the client-side code
    clientUrl: process.env.API_CLIENT_URL || '',
    // API URL to be used in the server-side code
    serverUrl:
      process.env.API_SERVER_URL ||
      `http://localhost:${process.env.PORT || 3000}`,
  },

  // This is for if you are running the server locally and don't have
  // internet access or can't send emails for some reason.
  disableEmail: process.env.DISABLE_EMAIL || false,

  supportEmail: process.env.SUPPORT_EMAIL,

  inviteFromEmail: process.env.INVITE_FROM_EMAIL,
  inviteFromPassword: process.env.INVITE_FROM_PASSWORD,

  // Database
  databaseUrl: process.env.DATABASE_URL,

  // Web analytics
  analytics: {
    segmentWriteKey: process.env.SEGMENT_WRITE_KEY || '',
  },

  adminToken: process.env.ADMIN_TOKEN || '',

  // Authentication
  auth: {
    jwt: { secret: process.env.JWT_SECRET },

    // https://developers.facebook.com/
    facebook: {
      id: process.env.FACEBOOK_APP_ID,
      secret:
        process.env.FACEBOOK_APP_SECRET,
    },

    // https://cloud.google.com/console/project
    google: {
      id:
        process.env.GOOGLE_CLIENT_ID,
      secret: process.env.GOOGLE_CLIENT_SECRET,
    },

    // https://apps.twitter.com/
    twitter: {
      key: process.env.TWITTER_CONSUMER_KEY,
      secret:
        process.env.TWITTER_CONSUMER_SECRET,
    },
  },
};
