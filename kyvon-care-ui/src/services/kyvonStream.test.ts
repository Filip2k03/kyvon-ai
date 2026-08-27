import test from 'node:test';
import assert from 'node:assert/strict';
import { KyvonStreamService } from './kyvonStream.js';

test('KyvonStreamService instantiates with default and custom endpoints', () => {
  const service = new KyvonStreamService('mock-api-key');
  assert.ok(service, 'Service should instantiate');

  const customService = new KyvonStreamService('mock-api-key', 'https://custom.endpoint.tech/v1');
  assert.ok(customService, 'Custom endpoint service should instantiate');
});

test('KyvonStreamService abortCurrentStream does not throw when null', () => {
  const service = new KyvonStreamService('mock-api-key');
  assert.doesNotThrow(() => {
    service.abortCurrentStream();
  });
});
