import _ from 'lodash';
import { QuizItemChoice } from '../models';

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

const appendChoicesToQuizItems = async quizItems => {
  const quizItemChoices = await getQuizItemChoices(quizItems);
  return mapChoicesToQuizItems(quizItems, quizItemChoices);
};

export default appendChoicesToQuizItems;
