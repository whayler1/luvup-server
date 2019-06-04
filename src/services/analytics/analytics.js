import Analytics from 'analytics-node';
import config from '../../config';

const { analytics: { segmentWriteKey } } = config;

const warnFunc = () =>
  console.warn(
    'analytics calls will not be made because of missing segment write key',
  );

const analytics = segmentWriteKey
  ? new Analytics(segmentWriteKey)
  : {
      track: warnFunc,
      identify: warnFunc,
    };

if (!segmentWriteKey) {
  warnFunc();
}

export default analytics;
