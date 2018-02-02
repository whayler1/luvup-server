import _ from 'lodash';
import moment from 'moment';

import { RelationshipScore, Coin } from '../models';

const dayThresholds = [30, 15, 7, 3, 1];

const getCoinCounts = async (user, relationship) => {
  const now = moment();

  const promises = dayThresholds.map(async dayCount => {
    const createdAtGt = now.subtract(dayCount, 'd').toDate();

    const count = await Coin.count({
      where: {
        userId: user.id,
        relationshipId: relationship.id,
        createdAt: {
          $gt: createdAtGt,
        },
      },
    });
  });
};

export const generateScore = _.debounce(async user => {
  const relationship = await user.getRelationship();
  // const coinCounts = await Promise.all(dayThresholds.map(async days => {
  //   await
  // }));
}, 10000);

export default {
  generateScore,
};
