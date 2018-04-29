import Analytics from 'analytics-node';
import config from '../config';

const { analytics: { segmentWriteKey } } = config;

const warnFunc = () =>
  console.warn('no tracking sent because segmentWriteKey is missing');

const analytics = segmentWriteKey
  ? new Analytics(segmentWriteKey)
  : {
      track: warnFunc,
      identify: warnFunc,
    };

export default analytics;
