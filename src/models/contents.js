'use strict';

import contentModelFromClientRepo from '../clients/content-model';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let contentSchemaObject = Object.assign({}, contentModelFromClientRepo.schema);
contentSchemaObject.updatedAt = { type: Date, 'default': Date.now };
contentSchemaObject.client = { type: String, required: true};

const contentSchema = new Schema(contentSchemaObject);
const contentModel = mongoose.model('Content', contentSchema);

export default contentModel;