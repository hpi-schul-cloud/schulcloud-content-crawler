'use strict';

var clients = [];
clients.push(require('clients/serlo'));

const contentModel = require('./contemt-model'); 

module.exports = function(){
  const app = this;
  app.addContent = addContent;

  //fetching all data from every client and push the data to the database
  clients.forEach((client) => {
    app.addContent(client.name, client.getAll());
  })

  //Get our initialize service to that we can bind hooks
  const clientsService = app.service('/clients');
};

function addContent (clientName, content) {

}