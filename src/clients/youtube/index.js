'use strict';

const config = require('./../../../config').youtube;
const request = require('request-promise');
const contentModel = require('./../content-model');
const helper = require('./../_helper/helper');
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
  for (let channel of config.channels) {
    channelPromises.push(new Promise((resolve, reject) => {
      return resolve(getYoutubeData(channel, 0));
    }));
  }
  return Promise.all(channelPromises).then((content) =>
      content.reduce((x, y) => x.concat(y))
  );
}

function getYoutubeData(channel, page = undefined, items = []) {
  if (page === undefined) {
    return new Promise((resolve) => {
      resolve(getContentModels(channel, items));
    });
  }
  return new Promise((resolve, reject) => {
    let requestParams = {
      part: 'id,snippet',
      type: 'video',
      channelId: channel.id,
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
  }).then((result) => { return getYoutubeData(channel, result.page, result.items) });
}

function getContentModels(channel, items) {
  let contentModels = [];
  for (let item in items) {
    contentModels.push(parseContentModel(channel, items[item]));
  }
  return contentModels;
}

function parseContentModel(channel, item) {
  let data = {};
  data.originId = item.id.videoId;
  data.title = item.snippet.title;
  data.url = 'https://www.youtube.com/watch?v=' + data.originId;
  data.license = channel.license;
  data.description = item.snippet.description;
  data.contentType = helper.getContentTypeFromName('video');
  data.creationDate = item.snippet.publishedAt;
  data.language = channel.language
  data.subjects = channel.subjects
  data.targetGroups = channel.targetGroups


  return contentModel.getModelObject(data);
}

module.exports = client;
