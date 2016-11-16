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
      addContent(client.name, client.getAll());
      callback(null, true);
    }
  });

  async.parallelLimit(clientsFunction, 5, 
    (errors, results) => console.log("successes: " + results.length + '/' + clients.length) );
};

function addContent (clientName, content) {
  return new contentModel({
    client: "test",
    name: "mathe",
    contentUrl: "http://google.de/"
  });
}