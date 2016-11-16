'use strict';

const assert = require('assert');
const app = require('../../../src/app');

describe('clients service', function() {
  it('registered the clients service', () => {
    assert.ok(app.service('clients'));
  });
});
