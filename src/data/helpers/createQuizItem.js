import { QuizItemChoice } from '../models';

const createQuizItem = async (
  user,
  lover,
  question,
  reward,
  choices,
  senderChoiceIndex,
  options = {},
) => {
  const quizItem = await user.createSentQuizItem({
    question,
    reward,
    relationshipId: user.RelationshipId,
    recipientId: lover.id,
    ...options,
  });

  const choiceObjs = await QuizItemChoice.bulkCreate(
    choices.map(answer => ({
      answer,
      quizItemId: quizItem.id,
    })),
  );

  await quizItem.update({
    senderChoiceId: choiceObjs[senderChoiceIndex].id,
  });

  return {
    ...quizItem.dataValues,
    choices: choiceObjs,
  };
};

export default createQuizItem;
