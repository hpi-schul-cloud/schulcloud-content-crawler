'use strict';

// content-model.js - A mongoose model
// 
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const contentSchema = new Schema({
  client: { type: String, required: true},
  name: { type: String, required: true},
  contentUrl: { type: String, required: true},
  
  createdAt: { type: Date, 'default': Date.now },
  updatedAt: { type: Date, 'default': Date.now }
});

const contentModel = mongoose.model('content', contentSchema);

module.exports = contentModel;