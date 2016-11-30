'use strict';
const content = require('./content');
const clients = require('./clients');
const authentication = require('./authentication');
const user = require('./user');
const mongoose = require('mongoose');
module.exports = function() {
  const app = this;

  mongoose.connect(app.get('mongodb'), {user:process.env.DB_USERNAME, pass:process.env.DB_PASSWORD});
  mongoose.Promise = global.Promise;

  app.configure(authentication);
  app.configure(user);
  app.configure(clients);
  app.configure(content);
};
