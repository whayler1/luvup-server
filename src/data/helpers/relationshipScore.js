import _ from 'lodash';
import moment from 'moment';
import { datetimeAndTimestamp } from './dateFormats';

import { Relationship, RelationshipScore, Coin, Jalapeno } from '../models';

const dailyTopHealth = 15;
const dayThresholds = [1, 3, 7];
const weights = [0.6, 0.3, 0.1];

const getPromises = (recipientId, relationshipId, model) => {
  const now = moment();

  return dayThresholds.map((dayCount, i) => {
    const createdAtGt = datetimeAndTimestamp(
      moment(now).subtract(dayCount, 'day'),
    );

    const query = {
      where: {
        recipientId,
        relationshipId,
        createdAt: {
          $gte: createdAtGt,
        },
      },
    };
    if (i > 0) {
      const createdAtLt = datetimeAndTimestamp(
        moment(now).subtract(dayThresholds[i - 1], 'day'),
      );
      // console.log('\ncreatedAtLt', createdAtLt);
      query.where.createdAt.$lt = createdAtLt;
    }
    const count = model.count(query);

    return count;
  });
};

const getCounts = async (recipientId, relationshipId) => {
  const coinPromises = getPromises(recipientId, relationshipId, Coin);
  const jalapenoPromises = getPromises(recipientId, relationshipId, Jalapeno);

  return Promise.all([
    Promise.all(coinPromises),
    Promise.all(jalapenoPromises),
  ]);
};

export const generateScore = async user => {
  console.log('\n\n--generateScore');

  const [coinCounts, jalapenoCounts] = await getCounts(
    user.id,
    user.RelationshipId,
  );

  console.log('\n\n coinCounts', coinCounts);
  console.log('\n\n jalapenoCounts', jalapenoCounts);
};

export default {
  generateScore,
};
