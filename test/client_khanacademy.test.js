'use strict'
let assert = require('assert');
let request = require('request-promise');
let sinon = require('sinon');
require('sinon-as-promised');
let khanClient = require('../src/clients/khanacademy');


describe('khan client', function() {
  describe('getAll', function() {
    before(function() {
      sinon.stub(request, 'get').resolves(JSON.stringify({test: 'val'}));
    });

    after(function() {
      request.get.restore();
    });
    it('converts the JSON response correctly to a contentModel', function() {
      khanClient.getAll();
    });
  });
});
