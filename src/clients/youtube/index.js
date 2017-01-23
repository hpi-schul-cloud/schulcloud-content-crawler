'use strict';

const config = require('./../../../config').youtube;
const request = require('request-promise');
const contentModel = require('./../content-model');
const google = require('googleapis');

const youtube = google.youtube({
  version: 'v3',
  auth: config.apiKey
});

let client = {
    getAll
};

function getAll() {
  return new Promise((resolve, reject) => {
    youtube.search.list({part: 'id,snippet',
      type: 'video',
      channelId: 'UCdQvwubOWGRB8JyoEC7lSbA',
      maxResults: 5
    }, function (err, data) {
      if (err) {
        return reject(err)
      }
      return resolve(data)
    });
  })
}

module.exports = client;
