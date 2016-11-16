'use strict';

var clients = [];
var normalizedPath = require("path").join(__dirname, "src");
require("fs").readdirSync(normalizedPath).forEach(function(folder) {
  clients.push(require("./src/" + folder));
});


const contentModel = require('./content-model'); 

module.exports = function(){
  //fetching all data from every client and push the data to the database
  clients.forEach((client) => {
    addContent(client.name, client.getAll());
  });
};

function addContent (clientName, content) {
  new contentModel({
    client: "test",
    name: "mathe",
    contentUrl: "http://google.de/"
  });
}