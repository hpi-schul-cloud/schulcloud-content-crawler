'use strict';

const contentModelFromClientRepo = require('../../clients/src/content-model');
// content-model.js - A mongoose model
// 
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var contentSchemaObject = Object.assign({}, contentModelFromClientRepo.schema);
contentSchemaObject.updatedAt = { type: Date, 'default': Date.now };
contentSchemaObject.client = { type: String, required: true};

const contentSchema = new Schema(contentSchemaObject);
const contentModel = mongoose.model('content', contentSchema);

module.exports = contentModel;