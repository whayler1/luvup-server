import { graphql } from 'graphql';
import _ from 'lodash';

import models, { Coin } from '../models';
import schema from '../schema';
import sequelize from '../sequelize';
import {
  createUser,
  deleteUser,
  loginUser,
  createRelationship,
} from '../../../test/helpers';

describe('coinCount', () => {
  let originalTimeout;

  beforeAll(async () => {
    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;
    await models.sync();
  });

  afterAll(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
  });

  it('should return the number of coins a user has received in their current relationship', async () => {
    const user = await createUser();
    const lover = await createUser();
    const relationship = await createRelationship(user, lover);
    const id_token = loginUser(user);
    const count = 4;

    const coinOptions = {
      senderId: lover.id,
      recipientId: user.id,
      relationshipId: relationship.id,
    };

    await Coin.bulkCreate(_.times(count, () => coinOptions));

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
});
