import { graphql } from 'graphql';
import _ from 'lodash';

import schema from '../schema';
import sequelize from '../sequelize';
import { Coin } from '../models';
import {
  createUser,
  deleteUser,
  loginUser,
  createRelationship,
} from '../../../test/helpers';

// const createCoins = (count, relationship, user, lover) =>
//   Promise.all(
//     _.times(count, () =>
//       relationship.createCoin({
//         senderId: lover.id,
//         recipientId: user.id,
//       }),
//     ),
//   );

const destroyCoins = coins => Promise.all(coins.map(coin => coin.destroy()));

it('should return the number of coins a user has received in their current relationship', async () => {
  const user = await createUser();
  const lover = await createUser();
  const relationship = await createRelationship(user, lover);
  const lovers = await relationship.getLover();
  const id_token = loginUser(user);
  const count = 4;

  const coinOptions = {
    senderId: lover.id,
    recipientId: user.id,
    relationshipId: relationship.id,
  };

  const coins = await Coin.bulkCreate(_.times(count, () => coinOptions));

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

  await deleteUser(user);
  await deleteUser(lover);
  await relationship.destroy();
  await Coin.destroy({ where: coinOptions });
});
