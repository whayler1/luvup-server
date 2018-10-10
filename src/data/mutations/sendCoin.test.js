import { graphql } from 'graphql';

import schema from '../schema';
import sequelize from '../sequelize';
import {
  createUser,
  deleteUser,
  loginUser,
  createRelationship,
} from '../../../test/helpers';
import { modelsSync } from '../test-helpers';

describe('sendCoin', () => {
  let originalTimeout;

  beforeAll(async () => {
    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;
    await modelsSync;
  });

  afterAll(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
  });

  it('should send a coin when a user is in a relationship', async () => {
    const user = await createUser();
    const lover = await createUser();
    const relationship = await createRelationship(user, lover);
    const id_token = loginUser(user);

    const query = `mutation {
    sendCoin {
      coin {
        isUsed recipientId senderId relationshipId
      }
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

    expect(result.data.sendCoin).toMatchObject({
      coin: {
        isUsed: false,
        recipientId: lover.id,
        senderId: user.id,
        relationshipId: relationship.id,
      },
    });

    await deleteUser(user);
    await deleteUser(lover);
    await relationship.destroy();
  });
});
