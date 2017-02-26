'use strict'
let assert = require('assert');
let request = require('request-promise');
let sinon = require('sinon');
// require('sinon-as-promised');
let youtubeClient = require('../src/clients/youtube');
try {
  var config = require('./../../../config').youtube;
} catch (e) {
  console.error("Please add a youtube apikey to the config.js in the root folder of the crawler.");
}
let google = require('googleapis');
let youtube = google.youtube({
  version: 'v3',
  auth: 'abc'
});
let youtubeResponse = require('./youtubeResponse.json');
let correctContentModel = {}; // tbd


describe('youtube client', function() {
    describe('getAll', function() {
        before(function() {
            sinon.stub(google, 'youtube', (args) => {
              return {
                search: {
                  list: (params, callback) => {
                    console.log("STUBBED");
                    // resolve(youtubeResponse);
                  }
                }
              };
            });
        });

        after(function() {
            google.youtube.restore();
        });
        it('converts the JSON response correctly to a contentModel', function() {
            return youtubeClient.getAll().then(function(result) {
              assert.equal(JSON.stringify(result[0]), JSON.stringify(correctContentModel));
            });
        });
    });
});
