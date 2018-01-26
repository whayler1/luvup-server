import { graphql } from 'graphql';
import _ from 'lodash';

import schema from '../schema';
import sequelize from '../sequelize';
// import config from '../../config';
import { Coin } from '../models';
import {
  createUser,
  createRelationship,
  deleteUser,
  loginUser,
} from '../../../test/helpers';

/**
 * JW: need to revisit this test. For some reason relationshipId is not being
 * returned in the response for the coin objects.
 */
xit('should return sent coins if they exist', async () => {
  console.log('\n\ntest--------');
  const user = await createUser();
  console.log('user', user);
  const lover = await createUser();
  console.log('\n\n---\nlover', lover);
  const relationship = await createRelationship(user, lover);
  console.log('relationship', relationship);
  //
  const id_token = loginUser(user);

  const count = 3;

  const coinOptions = {
    senderId: user.id,
    recipientId: lover.id,
  };

  // const coins = await Coin.bulkCreate(_.times(count, () => coinOptions));

  // const coins = await relationship.bulkCreateCoins(_.times(count, () => coinOptions));
  const coins = await Promise.all(
    _.times(count, coin => relationship.createCoin(coinOptions)),
  );

  console.log('coins', coins.map(coin => coin.dataValues));
  const query = `{
    sentCoins {
      rows {
        id isUsed createdAt senderId recipientId relationshipId
      }
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

  console.log('result.data', result);

  // await deleteUser(user);
  // await deleteUser(lover);
  // await relationship.destroy();
  // await Coin.destroy({ where: coinOptions });
});
