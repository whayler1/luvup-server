import Analytics from 'analytics-node';
import config from '../config';

const analytics = new Analytics(config.analytics.segmentWriteKey);

export default analytics;
