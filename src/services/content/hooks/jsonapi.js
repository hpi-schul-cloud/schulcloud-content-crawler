'use strict';

// src\services\content\hooks\jsonapi.js
//
// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/hooks/readme.html

const defaults = {};

module.exports = function(options) {
  // Always wrap in a function so you can pass options and for consistency.
  options = Object.assign({}, defaults, options);

  return function(hook) {
    hook.jsonapi = true;
    console.log('Execute JsonAPI Hook');

    console.log(hook.result);
    const data = hook.result.data;

    //TODO: process data

    // A good convention is to always return a promise.
    return Promise.resolve(hook);
  };
};
