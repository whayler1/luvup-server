import graphql, { GraphQLString } from 'graphql';
import FooType from '../types/FooType';
import { User, UserLogin, UserClaim, UserProfile } from '../models';

const foo1 = {
  type: FooType,
  args: {
    foo: { type: GraphQLString },
  },
  resolve: (value, { foo }) =>
    // await new Promise(resolve => setTimeout(resolve, 600));
    ({
      id: '123',
      email: foo,
    }),
};

export default foo1;
