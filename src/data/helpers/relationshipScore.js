import _ from 'lodash';
import moment from 'moment';

import { datetimeAndTimestamp } from './dateFormats';
import {
  Relationship,
  RelationshipScore,
  Coin,
  Jalapeno,
  LoveNote,
} from '../models';

const dailyTopHealth = 6;
const dayThresholds = [1, 4, 8];
const weights = [0.7, 0.2, 0.1];
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

const getCounts = async (recipientId, senderId, relationshipId) =>
  Promise.all([
    Promise.all(getPromises(recipientId, relationshipId, Coin)),
    Promise.all(getPromises(recipientId, relationshipId, Jalapeno)),
    Promise.all(getPromises(recipientId, relationshipId, LoveNote)),
    Promise.all(getPromises(senderId, relationshipId, Coin)),
    Promise.all(getPromises(senderId, relationshipId, Jalapeno)),
    Promise.all(getPromises(senderId, relationshipId, LoveNote)),
  ]);

const getScores = ary => ary.map((count, i) => count / topHealths[i]);
const getWeightedAverage = ary =>
  ary.reduce((val, score, i) => val + score * weights[i], 0);

export const generateScore = async user => {
  const userId = user.id;
  const relationshipId = user.RelationshipId;
  const relationship = await Relationship.findOne({
    where: { id: relationshipId },
  });
  const [lover] = await relationship.getLover({
    where: {
      $not: {
        id: user.id,
      },
    },
  });
  const loverId = lover.id;

  const [
    receivedCoinCounts,
    receivedJalapenoCounts,
    receivedLoveNotes,
    sentCoinCounts,
    sentJalapenoCounts,
    sentLoveNotes,
  ] = await getCounts(userId, loverId, relationshipId);

  const receivedPositiveTokens = receivedCoinCounts.map(
    (count, i) =>
      count + receivedLoveNotes[i] * 0.5 - receivedJalapenoCounts[i] * 0.2,
  );
  const sentPositiveTokens = sentCoinCounts.map(
    (count, i) => count + sentLoveNotes[i] * 0.5 - sentJalapenoCounts[i] * 0.1,
  );

  const receivedCoinScores = getScores(receivedPositiveTokens);
  const sentCoinScores = getScores(sentPositiveTokens);

  const receivedWeightedCoinScore = getWeightedAverage(receivedCoinScores);
  const sentWeightedCoinScore = getWeightedAverage(sentCoinScores);

  const scoreWeight = [
    { score: receivedWeightedCoinScore, weight: 0.8 },
    { score: sentWeightedCoinScore, weight: 0.2 },
  ];

  const scoreFuzzy = scoreWeight.reduce(
    (accumulator, score) => accumulator + score.score * score.weight,
    0,
  );

  const score = Math.min(Math.max(scoreFuzzy * 100, 0), 100);

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
