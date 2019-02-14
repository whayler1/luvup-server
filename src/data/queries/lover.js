import { validateJwtToken } from '../helpers';
import LoverType from '../types/LoverType';
import { UserNotLoggedInError } from '../errors';
import { User, Relationship, RelationshipScore } from '../models';

const resolve = async ({ request }) => {
  const verify = await validateJwtToken(request);

  if (!verify) {
    throw UserNotLoggedInError;
  }

  const user = await User.find({ where: { id: verify.id } });
  const relationship = await Relationship.find({
    where: { id: user.RelationshipId },
  });
  const [lover] = await relationship.getLover({
    where: {
      $not: {
        id: user.id,
      },
    },
  });
  const [relationshipScore] = await RelationshipScore.findAll({
    limit: 1,
    where: {
      relationshipId: relationship.id,
      userId: lover.id,
    },
    order: [['createdAt', 'DESC']],
  });

  console.log('\n\n relationshipScore', relationshipScore.dataValues);

  return {
    ...lover.dataValues,
    relationshipScore: {
      ...relationshipScore.dataValues,
      score: Math.round(relationshipScore.dataValues.score),
    },
  };
};

const lover = {
  type: LoverType,
  resolve,
};

export default lover;
