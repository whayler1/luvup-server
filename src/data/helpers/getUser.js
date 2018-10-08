import { User } from '../models';

const getLover = (userId, relationshipId) =>
  User.findOne({
    where: {
      RelationshipId: relationshipId,
      $not: {
        id: userId,
      },
    },
  });

const getUser = async (userId, shouldIncludeLover = true) => {
  const user = await User.findOne({ where: { id: userId } });
  const relationshipId = user.RelationshipId;
  const returnObj = { user, relationshipId };
  if (shouldIncludeLover) {
    const lover = await getLover(userId, relationshipId);
    returnObj.lover = lover;
  }

  return returnObj;
};

export default getUser;
