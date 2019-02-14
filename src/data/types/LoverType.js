import {
  GraphQLObjectType as ObjectType,
  GraphQLID as ID,
  GraphQLString as StringType,
  GraphQLNonNull as NonNull,
} from 'graphql';

import RelationshipScoreType from './RelationshipScoreType';

const LoverType = new ObjectType({
  name: 'Lover',
  fields: {
    id: { type: new NonNull(ID) },
    email: { type: StringType },
    username: { type: StringType },
    firstName: { type: StringType },
    lastName: { type: StringType },
    relationshipScore: { type: RelationshipScoreType },
  },
});

export default LoverType;
