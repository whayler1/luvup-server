import {
  GraphQLObjectType as ObjectType,
  GraphQLID as ID,
  GraphQLString as StringType,
  GraphQLNonNull as NonNull,
  GraphQLBoolean as BooleanType,
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
    isPlaceholder: { type: BooleanType },
    relationshipScore: { type: RelationshipScoreType },
  },
});

export default LoverType;
