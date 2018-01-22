import { graphql } from 'graphql';
import _ from 'lodash';

import schema from '../schema';
import sequelize from '../sequelize';
import {
  createUser,
  deleteUser,
  loginUser,
  createRelationship,
} from '../../../test/helpers';

const createCoins = (count, relationship, user, lover) =>
  Promise.all(
    _.times(count, () =>
      relationship.createCoin({
        senderId: lover.id,
        recipientId: user.id,
      }),
    ),
  );

it('should return the number of coins a user has received in their current relationship', async () => {
  const user = await createUser();
  const lover = await createUser();
  const relationship = await createRelationship(user, lover);
  const lovers = await relationship.getLover();
  const id_token = loginUser(user);
  const count = 4;

  await createCoins(count, relationship, user, lover);

  const query = `{
    coinCount {
      count
    }
  }`;

  const rootValue = {
    request: {
      cookies: {
        id_token,
      },
    },
  };

  const result = await graphql(schema, query, rootValue, sequelize);

  expect(result.data).toMatchObject({
    coinCount: {
      count,
    },
  });
});
