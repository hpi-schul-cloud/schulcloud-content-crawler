'use strict'
let assert = require('assert');
let request = require('request-promise');
let sinon = require('sinon');
require('sinon-as-promised');
let fs = require("fs");
let antaresClient = require('../src/clients/antares');
let correctContentModel = {
    originId: 'bpb-CP.BPB~00000149',
    title: 'Requiem',
    url: 'http://www.bpb.de/system/files/pdf/CZUVTZ.pdf',
    description: 'Requiem von Hans-Christian Schmid erzählt nach einer wahren Begebenheit aus den 1970er Jahren das Drama einer unter Epilepsie leidenden jungen Frau, an der nach einem seelischen Zusammenbruch ein Exorzismus vorgenommen wird.',
    contentType: 55,
    language: 'de-de',
    restrictions: {
        location: [{state: "HH"}]
    },
    popularity: 0,
    editorsPick: false
};
let antaresResponse = fs.readFileSync('./test/antaresResponse.xml').toString();

describe('antares client', function() {
    describe('getAll', function() {
        before(function() {
            sinon.stub(request, 'Request').resolves(antaresResponse);
        });

        after(function() {
            request.Request.restore();
        });
        it('converts the JSON response correctly to a contentModel', function() {
            return antaresClient.getAll().then(function(result) {
              assert.equal(JSON.stringify(result[0]), JSON.stringify(correctContentModel));
            });
        });
    });
});
