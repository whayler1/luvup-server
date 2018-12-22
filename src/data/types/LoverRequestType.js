import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLNonNull,
  GraphQLBoolean,
} from 'graphql';

import UserType from './UserType';

const LoverRequestType = new GraphQLObjectType({
  name: 'LoverRequest',
  fields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    isAccepted: { type: GraphQLBoolean },
    isSenderCanceled: { type: GraphQLBoolean },
    isRecipientCanceled: { type: GraphQLBoolean },
    sender: { type: UserType },
    recipient: { type: UserType },
    createdAt: { type: GraphQLString },
  },
});

export default LoverRequestType;
