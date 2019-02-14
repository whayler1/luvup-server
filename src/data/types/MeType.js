import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLNonNull,
  GraphQLList,
} from 'graphql';

import LoverType from './LoverType';

const MeType = new GraphQLObjectType({
  name: 'Me',
  fields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    email: { type: GraphQLString },
    username: { type: GraphQLString },
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    relationship: {
      type: new GraphQLObjectType({
        name: 'MeRelationship',
        fields: {
          id: { type: new GraphQLNonNull(GraphQLID) },
          createdAt: { type: GraphQLString },
          lovers: {
            type: new GraphQLList(LoverType),
          },
        },
      }),
    },
  },
});

export default MeType;
