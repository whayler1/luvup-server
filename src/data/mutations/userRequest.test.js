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
        email
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
        email
      }
    }`;

    const result = await graphql(schema, query, {}, {});
    const { data: { userRequest } } = result;

    expect(userRequest).toMatchObject({ email });
  });

  it('should set userCode to 012345 if using admin email hack', async () => {
    const uuid = uuidv1();
    const email = `justin+${uuid}@luvup.io`;

    const query = `mutation {
      userRequest(email: "${email}") {
        email
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

  it('should create a new user request and email if unused user request exists', async () => {
    const uuid = uuidv1();
    const email = `justin+${uuid}@luvup.io`;

    const salt = await bcrypt.genSalt();
    const code = await bcrypt.hash('012345', salt);

    await UserRequest.create({
      email,
      code,
    });

    const query = `mutation {
        userRequest(email: "${email}") {
          email
        }
      }`;

    const { data: { userRequest } } = await graphql(schema, query, {}, {});
    expect(userRequest).toMatchObject({ email });
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
          email
        }
      }`;

      const result = await graphql(schema, query, {}, {});

      expect(result.errors[0].message).toBe('Error sending confirmation email');
    });

    it('should return send email error when user request exists', async () => {
      const uuid = uuidv1();
      const email = `justin+${uuid}@luvup.io`;

      const salt = await bcrypt.genSalt();
      const code = await bcrypt.hash('012345', salt);

      await UserRequest.create({
        email,
        code,
      });

      const query = `mutation {
          userRequest(email: "${email}") {
            email
          }
        }`;

      const result = await graphql(schema, query, {}, {});
      expect(result.errors[0].message).toBe('Error sending confirmation email');
    });
  });
});
