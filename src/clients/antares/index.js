'use strict';

const request = require('request-promise');
const xml2js = require('xml2js-es6-promise');
const crypto = require('crypto');

const contentModel = require('./../content-model');
const helper = require('./../_helper/helper');

const _headers = {
    "content-type": "application/x-www-form-urlencoded",
};
const _arixEndpoint = 'https://arix.datenbank-bildungsmedien.net';
const _arionEndpoint = 'https://arion.datenbank-bildungsmedien.net';
const _postVarXML = 'xmlstatement';
const _postVarJson = 'json';
const _secret = 'vx6sfg7sdftsdfq3hr2hdf';

let _url = _arixEndpoint; // default
var _context = 'HH/HH/9999'; // default for test purposes

let client = {
    getAll
};

//member functions
function getAll() {
    // stick to xml for now
    let form = {
        context: _context,
        xmlstatement: '<search fields="text,titel"><condition field="text_fields">*</condition></search>'
    };

    return req('POST', form)
        .then(function(body) { return xml2js(body); })
        .then(function(json) { return fetchMedia(json) })
}


// helper
function req(method, form) {
    let options = {
        method: method,
        uri: _url,
        form: form,
        headers: _headers
    };

    return request(options)
        .then(function (body) {
            return body;
        })
        .catch(function (err) {
            // POST failed...
        });
}

function fetchMedia(json) {
    let requests = json.result.r.map((obj) => {
        let form = {
            context: _context,
            xmlstatement: '<notch identifier="' + obj['$'].identifier + '" />'
        }
        return req('POST', form).then((xml) => {
            return xml2js(xml)
        }).then((notchJson) => {
            let notch, id;
            try {
                notch = notchJson.notch['_'];
                id = notchJson.notch['$']['id'];
            }
            catch (e) {
                return Promise.reject(e);
            }
            let hash = createHash(notch, _secret);

            // fetch link for id
            let form = {
                context: _context,
                xmlstatement: '<link id="' + id + '">' + hash + '</link>'
            };

            return req('POST', form);
        }).then((xml) => {
            return xml2js(xml)
        }).then((links) => {
            let link = links.link.a[0]['$'].href;
            return createContentModel(link, obj)}, (error) => {});
    });
    return Promise.all(requests).then((content) =>
        content.filter(n => n)
    );
}

function createHash(notch, secret) {
  let phrase = notch + ':' + secret;
  return crypto.createHash('md5').update(notch + ':' + secret).digest('hex');
};

function createContentModel(link, obj) {
    let data = {
        originId: obj['$'].identifier,
        title: helper.getValueIfExists(obj, 'f', '2', '_'),
        url: link,
        license: helper.getValueIfExists(obj, 'f', '0', '_'), // TODO: what does this license mean?
        language: "de-de",
        description: helper.filterHTML(helper.getValueIfExists(obj, 'f', '1', '_')),
        type: getType(link),
        restrictions: {
            location: {
                state: [helper.getState('HH')] // this might become bigger once antares allows us to query more than just HH 
            }
        }
    }

    try {
        let content = contentModel.getModelObject(data);
        return content;
    } catch (e) {
        return
    }
}

// helper to parse properties for content model/learning objects
function getType(s) {
    let ending = s.substring(s.lastIndexOf('.'));
    let type = helper.getContentTypeFromEnding(ending);
    if (type === undefined) {
        return 55; // for antares, this is the default type for everything wthout ending (-->websites)
    }
    return type;
}

module.exports = client;
