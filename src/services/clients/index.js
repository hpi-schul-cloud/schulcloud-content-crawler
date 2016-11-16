'use strict';

var clients = [];
var normalizedPath = require("path").join(__dirname, "src");
require("fs").readdirSync(normalizedPath).forEach(function(folder) {
  clients.push(require("./src/" + folder));
});

var async = require('async');

const contentModel = require('./content-model'); 

module.exports = function(){
  //fetching all data from every client and push the data to the database
  var clientsFunction = clients.map((client) => {
    return function (callback) {
      addContent(client.name, client.getAll(callback));
    }
  });

  async.parallelLimit(clientsFunction, 5, 
    (errors, results) => console.log("successes: " + results.length + '/' + clients.length) );
};

function addContent (clientName, content) {
  var entry = new contentModel({
    client: clientName,
    name: "mathe",
    contentUrl: "http://google.de/"
  });

  console.log("Jonas ist verlegen.");
  return entry.save(function (err, fluffy) {
      if (err) return console.error(err);
  });
}