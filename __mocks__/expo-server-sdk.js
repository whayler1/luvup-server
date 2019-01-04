export const sendPushNotificationAsync = jest.fn();

function Expo() {}

Expo.prototype = {
  isExpoPushToken: () => true,
  sendPushNotificationAsync,
  chunkPushNotifications: () => {},
};

export default Expo;
