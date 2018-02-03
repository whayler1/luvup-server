import _ from 'lodash';
import moment from 'moment';
import { datetimeAndTimestamp } from './dateFormats';

import { Relationship, RelationshipScore, Coin, Jalapeno } from '../models';

const dailyTopHealth = 15;
const dayThresholds = [3, 7, 11];
const weights = [0.4, 0.35, 0.25];
const topHealths = dayThresholds.map((n, i, ary) => {
  if (i > 0) {
    return (n - ary[i - 1]) * dailyTopHealth;
  }
  return n * dailyTopHealth;
});

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
      query.where.createdAt.$lt = createdAtLt;
    }
    const count = model.count(query);

    return count;
  });
};

const getCounts = async (recipientId, relationshipId) =>
  Promise.all([
    Promise.all(getPromises(recipientId, relationshipId, Coin)),
    Promise.all(getPromises(recipientId, relationshipId, Jalapeno)),
  ]);

const getScores = ary => ary.map((count, i) => count / topHealths[i]);
const getWeightedAverage = ary =>
  ary.reduce((val, score, i) => val + score * weights[i], 0);

export const generateScore = async user => {
  const userId = user.id;
  const relationshipId = user.RelationshipId;

  const [coinCounts, jalapenoCounts] = await getCounts(userId, relationshipId);

  const coinScores = getScores(coinCounts);
  const jalapenoScores = getScores(jalapenoCounts);
  const weightedCoinScore = getWeightedAverage(coinScores);
  const weightedJalapenoScore = 1 - getWeightedAverage(jalapenoScores);
  const scoreFuzzy = Math.round(
    (weightedCoinScore * 0.75 + weightedJalapenoScore * 0.25) * 100,
  );
  const score = Math.min(Math.max(scoreFuzzy, 0), 100);

  const relationshipScore = await RelationshipScore.create({
    score,
    relationshipId,
    userId,
  });

  return relationshipScore;
};

export default {
  generateScore,
};
