export const UserNotLoggedInError = new Error('User not logged in');
export const PermissionError = new Error(
  'You do not have permission to edit this resource',
);

export default {
  UserNotLoggedInError,
  PermissionError,
};
