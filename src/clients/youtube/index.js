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
  let channelPromises = [];
  for (let channel of config.channelIds) {
    channelPromises.push(new Promise((resolve, reject) => {
      return resolve(getYoutubeData(channel, 0));
    }));
  }
  return Promise.all(channelPromises).then((content) =>
      content.reduce((x, y) => x.concat(y))
  );
}

function getYoutubeData(channelId, page = undefined, items = []) {
  if (page === undefined) {
    return new Promise((resolve) => {
      resolve(items);
    });
  }
  return new Promise((resolve, reject) => {
    let requestParams = {
      part: 'id,snippet',
      type: 'video',
      channelId: channelId,
      maxResults: 5
    };
    if (page && page !== 0) {
      requestParams.pageToken = page;
    }
    youtube.search.list(requestParams, function (err, data) {
      if (err) {
        return reject(err)
      }
      items = items.concat(data.items);
      resolve({items: items, page: data.nextPageToken});
    });
  }).then((result) => { return getYoutubeData(channelId, result.page, result.items) });
}

function parseChannelData(response) {

}

function parseContentModel(element) {

}

module.exports = client;
