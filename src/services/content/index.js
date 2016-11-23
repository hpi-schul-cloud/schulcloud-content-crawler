'use strict';

const service = require('feathers-mongoose');
// Require content model as defined by clients
const content = require('./../clients/content-model');

const afterFindHook = options => { // always wrap in a function so you can pass options and for consistency.
  return hook => {
    console.log('My custom hook ran after find. Now we can sort the results or do other stuff with it.');
    return Promise.resolve(hook); // A good convention is to always return a promise.
  };
};

module.exports = function() {
  const app = this;

  const options = {
    Model: content,
    paginate: {
      default: 5,
      max: 25
    }
  };

  var mongooseService = service(options);
  // console.log(mongooseService);

  // Initialize our service with any options it requires
  app.use('/contents', mongooseService);

  // Get our initialize service to that we can bind hooks
  const contentService = app.service('/contents');

  contentService.create = null;
  contentService.update = null;
  contentService.patch = null;
  contentService.remove = null;
  contentService.after({
    find: [afterFindHook()]
  });

};
