'use strict'
let assert = require('assert');
let contentModel = require('../src/clients/content-model')

let validData = {
    "originId": "LEARNLINE-00013358",
    "title": "\"-heim\"-Orte: Strukturelemente einer karolingischen Siedlungspolitik im südöstlichen Westfalen",
    "url": "https://www.lwl.org/LWL/Kultur/Westfalen_Regional/Siedlung/heim_Orte",
    "description": "Bestimmte Orte mit dem Siedlungsnamengrundwort \"-heim\" weisen in Westfalen ein auffälliges Verbreitungsmuster auf: Es sind Siedlungen, deren Ortsname eine Richtungsangabe enthält (Typ Ostheim) oder aus topografischen Merkmalen entlehnt ist (Typ Stocheim). Räumlich sind bzw. waren derartige ländliche Siedlungen um einen Ort mit im Mittelalter herausgehobener Zentralitätsfunktion gruppiert, und sie bilden ferner Siedlungsinseln aus.",
    "type": "19",
    "language": "de-de",
    "restrictions": {
        "location": {
            "state": ["HH"]
        }
    }
};
let invalidData = {
    "title": "\"-heim\"-Orte: Strukturelemente einer karolingischen Siedlungspolitik im südöstlichen Westfalen",
    "url": "https://www.lwl.org/LWL/Kultur/Westfalen_Regional/Siedlung/heim_Orte",
    "description": "Bestimmte Orte mit dem Siedlungsnamengrundwort \"-heim\" weisen in Westfalen ein auffälliges Verbreitungsmuster auf: Es sind Siedlungen, deren Ortsname eine Richtungsangabe enthält (Typ Ostheim) oder aus topografischen Merkmalen entlehnt ist (Typ Stocheim). Räumlich sind bzw. waren derartige ländliche Siedlungen um einen Ort mit im Mittelalter herausgehobener Zentralitätsfunktion gruppiert, und sie bilden ferner Siedlungsinseln aus.",
    "type": "19",
    "language": "de-de",
    "restrictions": {
        "location": {
            "state": ["HH"]
        }
    }
};

describe('content-model', function() {
    describe('validation', function() {
        it('accepts a valid data object', function() {
            assert.ok(contentModel.getModelObject(validData));
        });

        it('rejects a data object with incomplete required field', function() {
            assert.throws(() => {
                contentModel.getModelObject(invalidData)
            }, /required/);
        });
    });
});