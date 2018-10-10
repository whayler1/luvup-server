import { modelsSync } from './src/data/test-helpers';

let originalTimeout;

beforeAll(async () => {
  originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;
  await modelsSync;
});

afterAll(() => {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
});
