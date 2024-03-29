import bcrypt from 'bcrypt';
import { GraphQLObjectType, GraphQLString, GraphQLBoolean } from 'graphql';
import moment from 'moment';
import { UserRequest } from '../models';

const confirmUserRequestCode = {
  type: new GraphQLObjectType({
    name: 'ConfirmUserRequestCode',
    fields: {
      success: { type: GraphQLBoolean },
      error: { type: GraphQLString },
    },
  }),
  args: {
    email: { type: GraphQLString },
    code: { type: GraphQLString },
  },
  resolve: async ({ request }, { email, code }) => {
    if (!email) {
      return { error: 'missing email' };
    }
    if (!code) {
      return { error: 'missing code' };
    }

    const userRequest = await UserRequest.findOne({ where: { email } });

    if (userRequest) {
      const diff = moment().diff(moment(userRequest.updatedAt), 'days');
      if (diff > 0) {
        return { error: 'expired code' };
      }

      const isCodeMatch = await bcrypt.compare(code, userRequest.code);
      if (!isCodeMatch) {
        return { error: 'invalid code' };
      }
      const existingUser = await userRequest.getUser();
      if (existingUser) {
        return { error: 'user request used' };
      }

      return { success: true };
    }

    return { error: 'no user request' };
  },
};

export default confirmUserRequestCode;
