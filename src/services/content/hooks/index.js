'use strict';

const globalHooks = require('../../../hooks');
const hooks = require('feathers-hooks');

const jsonapi = require('./jsonapi');

const myHook = options => { // always wrap in a function so you can pass options and for consistency.
  return hook => {
    console.log('My custom hook ran');
    return Promise.resolve(hook); // A good convention is to always return a promise.
  };
};

exports.before = {
  all: [],
  find: [],
  get: [],
  create: [],
  update: [],
  patch: [],
  remove: []
};

exports.after = {
  all: [],
  find: [myHook(), jsonapi()],
  get: [],
  create: [],
  update: [],
  patch: [],
  remove: []
};
