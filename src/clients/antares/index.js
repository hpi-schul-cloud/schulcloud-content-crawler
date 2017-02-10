'use strict';

const request = require('request-promise');
const libxmljs = require('libxmljs');
const crypto = require('crypto');
const sprintf = require("sprintf-js").sprintf;
const Bottleneck = require("bottleneck");

const contentModel = require('./../content-model');
const helper = require('./../_helper/helper');


const ARIX_URL = 'https://arix.datenbank-bildungsmedien.net';
try {
    var SECRET = require('./../../../config').antares.secret;
} catch(e) {
    console.error("please add the antares secret to the config.js");
}
const DEFAULT_CONTEXT = 'HH/HH/9999'; // default for test purposes
const DEFAULT_HEADERS = {
    'Content-Type': 'application/x-www-form-urlencoded'
};

const SEARCH_FIELDS = ['text', 'titel', 'typ', 'url'];
const SEARCH_STATEMENT = '<search limit="10000" fields="' + SEARCH_FIELDS.join() + '">' +
                         '<condition field="text_fields">*</condition>' +
                         '</search>';
const REQUEST_NOTCH_STATEMENT = '<notch identifier="%s" />';
const REQUEST_URL_STATEMENT = '<link id="%s">%s</link>';

const RESULT_ENTRIES_XPATH = 'r';
const EXTRACT_FIELD_XPATH = 'f[@n="%s"]';
const DIRECT_LINK_XPATH = 'a[text()="direct"]/@href';

let client = {
    getAll
};

let limiter = new Bottleneck(100, 5);

//member functions
function getAll() {
    return sendRequest(SEARCH_STATEMENT).then(parseSearchResult);
}


// helper functions
function sendRequest(statement, priority) {
    priority = priority || 5;
    let options = {
        method: 'POST',
        uri: ARIX_URL,
        headers: DEFAULT_HEADERS,
        form: {
            context: DEFAULT_CONTEXT,
            xmlstatement: statement
        }
    };

    return limiter.schedulePriority(priority, () => {
        return request(options).then(response => {
            response = response.replace('\u0001', '').replace('\u0006', '');
            let responseDoc = libxmljs.parseXml(response);
            if(responseDoc.root().name() == 'error') {
                let error = responseDoc.root().text();
                throw new Error(error);
            }

            return responseDoc;
        });
    });
}

function parseSearchResult(response) {
    // Get promises for parsing the single content resources.
    // If error occurs during parsing, return error instead of content model.
    let promises = response.find(RESULT_ENTRIES_XPATH).map(elem => {
        return parseContentModel(elem).catch(e => {
            console.error(e + '; received: ' + elem.toString());
            return e;
        });
    });

    // Return promise, which is waiting for the parsing promises to complete.
    // Filter errors from result array to only return content models.
    return Promise.all(promises)
        .then(results => results.filter(obj => !(obj instanceof Error)));
}

function parseContentModel(elem) {
    let data = {
        originId: elem.attr('identifier').value(),
        title: extractField(elem, 'titel'),
        url: extractField(elem, 'url'),
        license: extractField(elem, 'license'), // TODO: what does this license mean?
        language: "de-de",
        description: extractField(elem, 'text'),
        type: extractField(elem, 'typ'),
        restrictions: {
            location: {
                state: [helper.getState('HH')] // this might become bigger once antares allows us to query more than just HH
            }
        }
    };

    // Check, if data contains url
    if(data.url) {
        if(!data.contentType) {
            data.contentType = getTypeFromUrl(data.url);
        }

        return Promise.resolve(contentModel.getModelObject(data));
    }

    return requestNotch(data.originId).then(requestUrl).then(url => {
        data.url = url;
        if(!data.type) {
            data.type = getTypeFromUrl(data.url);
        }

        return contentModel.getModelObject(data);
    });
}

function extractField(elem, fieldName) {
    let xpath = sprintf(EXTRACT_FIELD_XPATH, fieldName);
    let fieldNode = elem.get(xpath);
    if (fieldNode) {
        return fieldNode.text();
    }
}

function requestNotch(resourceId) {
    let statement = sprintf(REQUEST_NOTCH_STATEMENT, resourceId);

    return sendRequest(statement, 9).then(response => {
        return {
            id: response.root().attr('id').value(),
            value: response.root().text(),
        }
    });
}

function requestUrl(notch) {
    let hash = createHash(notch.value, SECRET);
    let statement = sprintf(REQUEST_URL_STATEMENT, notch.id, hash);

    return sendRequest(statement, 0).then(response => {
        return response.get(DIRECT_LINK_XPATH).value();
    });
}

function createHash(notch, secret) {
  let phrase = notch + ':' + secret;
  return crypto.createHash('md5').update(phrase).digest('hex');
}

// helper to parse properties for content model/learning objects
function getTypeFromUrl(url) {
    let ext = url.substring(url.lastIndexOf('.'));
    let type = helper.getContentTypeFromEnding(ext);
    if (type === undefined) {
        return 55; // for antares, this is the default type for everything wthout file extension (-->websites)
    }
    return type;
}

module.exports = client;
