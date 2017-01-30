'use strict';

var striptags = require('striptags');

let helper = {
    getState,
    getClass,
    getSchoolType,
    getSubjects,
    getContentTypeFromEnding,
    getContentTypeFromName,
    filterHTML,
    getValueIfExists
};

const states = {
    "baden-wï¿½rttemberg": "BW",
    "baden-württemberg": "BW",
    "bw": "BW",
    "bayern": "BY",
    "by": "BY",
    "berlin": "BE",
    "be": "BE",
    "brandenburg": "BB",
    "bb": "BB",
    "bremen": "HB",
    "hb": "HB",
    "hamburg": "HH",
    "hh": "HH",
    "hessen": "HE",
    "he": "HE",
    "mecklenburg-vorpommern": "MV",
    "mv": "MV",
    "niedersachsen": "NI",
    "ni": "NI",
    "nordrhein-westfalen": "NW",
    "nrw": "NW",
    "nw": "NW",
    "rheinland-pfalz": "RP",
    "rp": "RP",
    "saarland": "SL",
    "sl": "SL",
    "sachsen": "SN",
    "sn": "SN",
    "sachsen-anhalt": "ST",
    "st": "ST",
    "schleswig-holstein": "SH",
    "sh": "SH",
    "thï¿½ringen": "TH",
    "thüringen": "TH",
    "th": "TH",
}

const schoolTypeMatchingArray = [
    {
        test: function(s) { return s.indexOf("Gymnasium") !== -1; },
        schoolType: "Gymnasium"
    },
    {
        test: function(s) { return s.indexOf("Realschule") !== -1; },
        schoolType: "Realschule"
    },
    {
        test: function(s) { return s.indexOf("Mittelschule") !== -1; },
        schoolType: "Mittelschule"
    },
    {
        test: function(s) { return s.indexOf("Hauptschule") !== -1; },
        schoolType: "Hauptschule"
    },
    {
        test: function(s) { return s.indexOf("OS") !== -1 || s.indexOf("Oberschule") !== -1 || s.indexOf("Fachoberschule") !== -1; },
        schoolType: "Oberschule"
    },
    {
        test: function(s) { return s.indexOf("Sonderschule") !== -1; },
        schoolType: "Sonderschule"
    },
    {
        test: function(s) { return s.indexOf("Hauptschule") !== -1; },
        schoolType: "Hauptschule"
    },
    {
        test: function(s) { return s.indexOf("Gesamtschule") !== -1; },
        schoolType: "Gesamtschule"
    },
    {
        test: function(s) { return s.indexOf("Grundschule") !== -1; },
        schoolType: "Grundschule"
    },
    {
        test: function(s) { return s.indexOf("Berufsschule") !== -1; },
        schoolType: "Berufsschule"
    },
]

const subjectsMatchingArray = [
    {
        test: function(s) {return s.indexOf("Mathe") !== -1},
        subjects: ["380"]
    },
    {
        test: function(s) { return s.indexOf("Bio") !== -1 },
        subjects: ["080"]
    },
    {
        test: function(s) { return s.indexOf("Chemie") !== -1 },
        subjects: ["100"]
    },
    {
        test: function(s) { return s.indexOf("Deutsch als Fremdsprache") !== -1  },
        subjects: ["120", "200 40"],
    },
    {
        test: function(s) { return s.indexOf("Deutsch") !== -1 },
        subjects: ["120"]
    },
    {
        test: function(s) { return s.indexOf("Geo") !== -1 },
        subjects: ["220"]
    },
    {
        test: function(s) { return s.indexOf("Geschichte") !== -1 },
        subjects: ["240"]
    },
    {
        test: function(s) { return s.indexOf("Informatik") !== -1 },
        subjects: ["320"]
    },
    {
        test: function(s) { return s.indexOf("Musik") !== -1 },
        subjects: ["420"]
    },
    {
        test: function(s) { return s.indexOf("Philospohie") !== -1 },
        subjects: ["450"]
    },
    {
        test: function(s) { return s.indexOf("Physik") !== -1 },
        subjects: ["460"]
    },
    {
        test: function(s) { return s.indexOf("Politik") !== -1 },
        subjects: ["480"]
    },
    {
        test: function(s) { return s.indexOf("Psychologie") !== -1 },
        subjects: ["510"]
    },
    {
        test: function(s) { return s.indexOf("Religion") !== -1 },
        subjects: ["520"]
    },
    {
        test: function(s) { return s.indexOf("Sex") !== -1 },
        subjects: ["560"]
    },
    {
        test: function(s) { return s.indexOf("Sport") !== -1 },
        subjects: ["600"]
    },
    {
        test: function(s) { return s.indexOf("Wirtschaft") !== -1 },
        subjects: ["700"]
    },
    {
        test: function(s) { return s.indexOf("Englisch") !== -1 },
        subjects: ["200 01"]
    },
    {
        test: function(s) { return s.indexOf("Französisch") !== -1 },
        subjects: ["200 02"]
    },
    {
        test: function(s) { return s.indexOf("Griechisch") !== -1 },
        subjects: ["200 03"]
    },
    {
        test: function(s) { return s.indexOf("Italienisch") !== -1 },
        subjects: ["200 04"]
    },
    {
        test: function(s) { return s.indexOf("Latein") !== -1 },
        subjects: ["200 05"]
    },
    {
        test: function(s) { return s.indexOf("Russisch") !== -1 },
        subjects: ["200 06"]
    },
    {
        test: function(s) { return s.indexOf("Spanisch") !== -1 },
        subjects: ["200 07"]
    },
    {
        test: function(s) { return s.indexOf("Türkisch") !== -1 },
        subjects: ["200 08"]
    },
    {
        test: function(s) { return s.indexOf("Sorbisch") !== -1 },
        subjects: ["200 09"]
    },
    {
        test: function(s) { return s.indexOf("Dänisch") !== -1 },
        subjects: ["200 10"]
    },
    {
        test: function(s) { return s.indexOf("Esperanto") !== -1 },
        subjects: ["200 80"]
    },
    {
        test: function(s) { return s.indexOf("Nachhaltigkeit") !== -1 },
        subjects: ["640"] // this isn't really represented in the schema...
    },
]

//member functions
// maps a state string to a unified two-letter version of the state
function getState(s) {
    let state = states[s.toLowerCase()];
    return state;
}

// maps a string representing the age group to a unified version of it
function getClass(s) {
        // for now, just return the number, since everything we've seen so far is some way of "Klasse 8" or "8. Klasse" or "Klassenstufe 8"
        // probably needs to be done more precisely
        return s.replace(/\D/g,'');
    }

// this helper method defines, which school types are supported and maps each string to the closest representation
function getSchoolType(s) {
    for (var i = 0; i < schoolTypeMatchingArray.length; i++) {
        if (schoolTypeMatchingArray[i].test(s)) {
            return schoolTypeMatchingArray[i].schoolType;
        }
    }
}

// giving an array of subject string, this helper returns an array of the subject strings from http://agmud.de/wp-content/uploads/2013/09/sgsyst-20121219.pdf
function getSubjects(a) {
    // TODO: Maybe also get description and keywords to find more fine-granular subjects as defined in http://agmud.de/wp-content/uploads/2013/09/sgsyst-20121219.pdf
    let uniformSubjects = [];
    for (var i = 0; i < a.length; i++) {
        for (var j = 0; j < subjectsMatchingArray.length; j++) {
            if(subjectsMatchingArray[j].test(a[i])) {
                for (var k = 0; k < subjectsMatchingArray[j].subjects.length; k++) {
                    uniformSubjects.push(subjectsMatchingArray[j].subjects[k]);
                }
                break;
            }
        }
    }

    return uniformSubjects;
}

function getContentTypeFromEnding(s) {
    switch (s) {
        case 'mp3':
        case 'wav':
        case 'wma':
        case 'aac':
        case 'flac':
            return 29;
        case 'mp4':
        case 'avi':
        case 'wmv':
        case 'mov':
        case 'vob':
        case 'mpg':
            return 5501;
        case 'doc':
        case 'docx':
        case 'pdf':
            return 79;
    }
}

function getContentTypeFromName(name) {
  switch(name) {
    case 'audio':
    case 'music':
    case 'podcast':
      return 29;
    case 'video':
      return 5501;
    case 'document':
      return 79;
  }
}

function filterHTML(s) {
    return striptags(s);
}

function getValueIfExists(obj) {
  var args = Array.prototype.slice.call(arguments, 1);

  for (var i = 0; i < args.length; i++) {
    if (!obj || !obj.hasOwnProperty(args[i])) {
      return undefined;
    }
    obj = obj[args[i]];
  }
  return obj;
}

module.exports = helper;
