'use strict';

const assert = require('assert');
const app = require('../../../src/app');

describe('content service', function() {
  it('registered the contents service', () => {
    assert.ok(app.service('contents'));
  });
});
