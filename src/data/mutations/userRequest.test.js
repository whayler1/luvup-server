import { graphql } from 'graphql';
import uuidv1 from 'uuid/v1';
import bcrypt from 'bcrypt';

import schema from '../schema';
import { UserRequest } from '../models';
import { modelsSync } from '../test-helpers';
import emailHelper from '../helpers/email';

jest.mock('../helpers/email');

describe('userRequest', () => {
  let originalTimeout;

  beforeAll(async () => {
    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;
    await modelsSync;
  });

  afterAll(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
  });

  it('should return an error if a user with the requested email already exists', async () => {
    const uuid = uuidv1();
    const email = `justin+${uuid}@luvup.io`;

    const userRequest = await UserRequest.create({
      email,
      code: '123456',
    });
    await userRequest.createUser({
      username: uuid,
      firstName: 'Jason',
      lastName: 'Wents',
      fullName: 'Jason Wents',
      email,
      emailConfirmed: true,
      password: 'Testing123',
    });

    const query = `mutation {
      userRequest(email: "${email}") {
        email error
      }
    }`;

    const result = await graphql(schema, query, {}, {});

    expect(result.errors[0].message).toBe(
      'There is already a user with this email',
    );
  });

  it('should allow user to request access', async () => {
    const uuid = uuidv1();
    const email = `justin+${uuid}@luvup.io`;

    const query = `mutation {
      userRequest(email: "${email}") {
        email error
      }
    }`;

    const result = await graphql(schema, query, {}, {});
    const { data } = result;

    expect(data.userRequest).toMatchObject({
      email,
      error: null,
    });
  });

  it('should set userCode to 012345 if using admin email hack', async () => {
    const uuid = uuidv1();
    const email = `justin+${uuid}@luvup.io`;

    const query = `mutation {
      userRequest(email: "${email}") {
        email error
      }
    }`;

    await graphql(schema, query, {}, {});

    const userRequest = await UserRequest.findOne({
      where: {
        email,
      },
    });

    const isCodeMatch = await bcrypt.compare('012345', userRequest.code);

    expect(isCodeMatch).toBe(true);
  });

  describe('when sendEmail rejects', () => {
    /* eslint-disable no-underscore-dangle */
    beforeAll(() => {
      emailHelper.__setIsSendEmailResolve(false);
    });

    afterAll(() => {
      emailHelper.__setIsSendEmailResolve(true);
    });
    /* eslint-disable no-underscore-dangle */

    it('should return send email error', async () => {
      const uuid = uuidv1();
      const email = `justin+${uuid}@luvup.io`;

      const query = `mutation {
        userRequest(email: "${email}") {
          email error
        }
      }`;

      const result = await graphql(schema, query, {}, {});

      expect(result.errors[0].message).toBe('Error sending confirmation email');
    });
  });
});
