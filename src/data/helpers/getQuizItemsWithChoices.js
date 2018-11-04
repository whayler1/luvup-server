import _ from 'lodash';
import { QuizItem, QuizItemChoice } from '../models';

const mapQuizItemIds = quizItems => quizItems.map(quizItem => quizItem.id);

const getQuizItemChoices = quizItems =>
  QuizItemChoice.findAll({
    where: {
      quizItemId: {
        $or: mapQuizItemIds(quizItems),
      },
    },
  });

const mapChoicesToQuizItems = (quizItems, quizItemChoices) =>
  quizItems.map(quizItem => ({
    ...quizItem.dataValues,
    choices: _.remove(
      quizItemChoices,
      quizItemChoice => quizItemChoice.quizItemId === quizItem.id,
    ),
  }));

export const appendChoicesToQuizItems = async quizItems => {
  const quizItemChoices = await getQuizItemChoices(quizItems);
  return mapChoicesToQuizItems(quizItems, quizItemChoices);
};

const getQuizItemsWithChoices = async (
  relationshipId,
  limit = 20,
  offset = 0,
  options = {},
) => {
  const res = await QuizItem.findAndCountAll({
    limit,
    offset,
    where: {
      relationshipId,
      ...options,
    },
    order: [['createdAt', 'DESC']],
  });

  const { rows, count } = res;

  const quizItemsWithChoices = await appendChoicesToQuizItems(rows);
  return { rows: quizItemsWithChoices, count };
};

export default getQuizItemsWithChoices;
