'use strict'
let assert = require('assert');
let request = require('request-promise');
let sinon = require('sinon');
require('sinon-as-promised');
let serloClient = require('../src/clients/serlo');
let serloResponse = require('./serloResponse.json');
let correctContentModel = { originId: '1495',
  title: 'Addition',
  url: 'https://de.serlo.org/mathe/zahlen-groessen/grundrechenarten/addition/addition',
  license: [ 'https://creativecommons.org/licenses/by-sa/4.0/' ],
  description: 'Die Addition, umgangssprachlich auch Plus-Rechnen genannt, ist eine der vier Grundrechenarten. Oft sagt man statt "addieren" auch "zusammenzählen". Die Zahlen, die addiert werden, nennt man Summanden , den Ausdruck: 1. Summand + 2. Summand nennt man Summe und das Ergebnis der Rechnung: Wert ...',
  contentType: 55,
  lastModified: new Date('2016-06-04T07:04:14.000Z'),
  language: 'de-de',
  subjects: [ '380' ],
  targetGroups:
   [ { state: 'BY', schoolType: 'Gymnasium', grade: '5' },
     { state: 'BY', schoolType: 'Realschule', grade: '6' },
     { state: 'BY', schoolType: 'Realschule', grade: '5' },
     { state: 'BY', schoolType: 'Mittelschule', grade: '5' },
     { state: 'SH', schoolType: 'Gymnasium', grade: '5' } ],
  tags:
   [ 'Addition',
     'Grundrechenarten',
     'Zahlen und Größen',
     'Mathe',
     'Ganze Zahlen',
     'Klasse 5',
     'Gymnasium',
     'Bayern',
     'Deutschland',
     'Klasse 6',
     'Realschule',
     'Mittelschule',
     'Natürliche Zahlen',
     '5. Klasse',
     'Gymnasium G9',
     'Schleswig-Holstein',
     'Gymnasium - G9' ],
  restrictions: null,
  popularity: 0,
  editorsPick: false
};


describe('serlo client', function() {
    describe('getAll', function() {
        before(function() {
            sinon.stub(request, 'Request').resolves(JSON.stringify(serloResponse));
        });

        after(function() {
            request.Request.restore();
        });
        it('converts the JSON response correctly to a contentModel', function() {
            return serloClient.getAll().then(function(result) {
              assert.equal(JSON.stringify(result[0]), JSON.stringify(correctContentModel));
            });
        });
    });
});
