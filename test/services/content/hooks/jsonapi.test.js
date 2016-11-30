'use strict';

const assert = require('assert');
const jsonapi = require('../../../../src/services/content/hooks/jsonapi.js');

describe('content jsonapi hook', function() {
  it('hook can be used', function() {
    const mockHook = {
      type: 'after',
      app: {},
      params: {},
      result: {},
      data: {}
    };

    jsonapi()(mockHook);

    assert.ok(mockHook.jsonapi);
  });
});
