'use strict';

var clients = [];
const path = require("path");

var normalizedPath = path.join(__dirname, "../../clients/src/");
require("fs").readdirSync(normalizedPath).forEach(function(folder) {
  if(!folder.endsWith('.js') && !folder.endsWith('antares') ) {
    clients.push(require(path.join(normalizedPath, folder + "/client")));
  }
});


const contentModel = require('./content-model'); 
const async = require('async-q');
const service = require('feathers-mongoose');

module.exports = function(){
  var app = this;

  contentModel.collection.drop();
  //fetching all data from every client and push the data to the database
  var clientsPromises = clients
    .map((client) => client.constructor())
    .filter((client) => {console.log(client); client.getAll !== undefined;})
    .map((client) => {
      console.log("hama");
      return new Promise(client.getAll())
          .then(function (data) {
            return contentModel.collection.insert(data);
          })
          .then((data) => console.log(data))
          .catch((error) => console.log(error + " failed"))
      }
    );

  var options = {
    Model: contentModel,
    paginate: {
      default: 5,
      max: 25
    }
  };
 
  app.use('/contents', service(options));
};
