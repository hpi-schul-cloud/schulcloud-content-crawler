'use strict';

const service = require('feathers-mongoose');
// Require content model as defined by clients
const content = require('./../clients/content-model');
// Require service hooks
const hooks = require('./hooks/index');

module.exports = function() {
  const app = this;

  const options = {
    Model: content,
    paginate: {
      default: 5,
      max: 25
    }
  };

  let mongooseService = service(options);

  // Initialize our service with any options it requires
  app.use('/contents', mongooseService);

  // Get our initialize service to that we can bind hooks
  const contentService = app.service('/contents');

  contentService.create = null;
  contentService.update = null;
  contentService.patch = null;
  contentService.remove = null;
  contentService.hooks(hooks);
};
