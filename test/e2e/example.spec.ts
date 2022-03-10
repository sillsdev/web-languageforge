import { test, expect, Page } from '@playwright/test';
import { testControl } from './jsonrpc';

test.only('API call', async ({ request }) => {
  const result = await testControl(request, 'check_test_api');
  expect(result).toBeDefined();
  expect(result).toHaveProperty('api_is_working');
  expect(result.api_is_working).toBeTruthy();
});
