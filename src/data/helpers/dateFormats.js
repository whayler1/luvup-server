import moment from 'moment-timezone';

export const datetimeAndTimestamp = momentObj =>
  momentObj.format('YYYY-MM-DD HH:mm:ss.SSSZ');

export default {
  datetimeAndTimestamp,
};
