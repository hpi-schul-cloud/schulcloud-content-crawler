'use strict';

var clients = [];
var normalizedPath = require("path").join(__dirname, "src");
require("fs").readdirSync(normalizedPath).forEach(function(folder) {
  clients.push(require("./src/" + folder));
});


const contentModel = require('./content-model'); 
const async = require('async-q');
const service = require('feathers-mongoose');

module.exports = function(){
  var app = this;

  contentModel.collection.drop();
  //fetching all data from every client and push the data to the database
  var clientsPromises = clients.map((client) => 
    client.getAll()
        .then(function (data) {
          return contentModel.collection.insert(data);
        })
        .then((data) => console.log(data))
        .catch((error) => console.log(error + " failed"))
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
