'use strict'
let assert = require('assert');
let request = require('request-promise');
let sinon = require('sinon');
require('sinon-as-promised');
let khanClient = require('../src/clients/khanacademy');
let khanResponse = require('./khanResponse.json');
let correctContentModel = {
    originId: 'x3f2a1471',
    title: 'Counting small numbers',
    url: 'https://de.khanacademy.org/math/early-math/cc-early-math-counting-topic/cc-early-math-counting',
    license: null,
    description: 'Learn to count from 0 to 20.',
    contentType: 50,
    creationDate: null,
    lastModified: new Date("2016-09-13T20:36:00.000Z"),
    subjects: ['380'],
    tags: ['Einstieg in die Mathematik', 'Das Zählen'],
    restrictions: null,
    relatedResources: [{
            relationType: 'episode',
            originId: 'x9b4a5e7a'
        },
        {
            relationType: 'episode',
            originId: 'x1a52b63e'
        }
    ],
    popularity: 0,
    editorsPick: false
};


describe('khan client', function() {
    describe('getAll', function() {
        before(function() {
            sinon.stub(request, 'get').resolves(JSON.stringify(khanResponse));
        });

        after(function() {
            request.get.restore();
        });
        it('converts the JSON response correctly to a contentModel', function() {
            return khanClient.getAll().then(function(result) {
              assert.equal(JSON.stringify(result[0]), JSON.stringify(correctContentModel));
            });
        });
    });
});
