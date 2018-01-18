import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLNonNull,
  GraphQLInt,
  GraphQLFloat,
  GraphQLBoolean,
} from 'graphql';

import UserType from './UserType';

const LoverRequestType = new GraphQLObjectType({
  name: 'LoverRequest',
  fields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    isAccepted: { type: GraphQLBoolean },
    recipient: { type: UserType },
  },
});

export default LoverRequestType;
