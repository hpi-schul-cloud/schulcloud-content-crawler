'use strict';

var clients = [];
const path = require("path");
const fs = require("fs"); 

var normalizedPath = path.join(__dirname, "../../clients/src/");
fs.readdirSync(normalizedPath)
  .filter((file) => fs.statSync(path.join(normalizedPath, file)).isDirectory())
  .forEach(function(name) {
    let module = require(path.join(normalizedPath, name + "/client"));
    clients.push({module, name});
  });
clients = clients.filter((client) => client.module.getAll !== undefined);

const contentModel = require('./content-model');
const async = require('async-q');
const service = require('feathers-mongoose');

module.exports = function(){
  var app = this;

  app.use('/startFetching', {
    find() {
      return fetchData();
    }
  });

  //fetchData();
};

//fetching all data from every client and push the data to the database
function fetchData () {
  var errors = [];
  var clientsPromises = clients
    .map((client) =>
      client.module.getAll()
          .then((data) => insertIntoDatabase(client.name, data))
          .catch((error) => {
            console.error(client.name + ' failed with error:' + error);
            errors.push({client: client.name, error: error});
          })
    );

  console.log('Will fetch data from ' + clientsPromises.length + ' clients');

  return Promise.all(clientsPromises).then((data) => {
    var successes = clients
                  .filter((client) => errors.filter((error) => error.client === client.name).length == 0)
                  .map((client) => client.name);
    var text = successes.length + '/' + clients.length + ' clients successfully fetched data';
    
    console.log(text);
    return {message: text,
            clients: clients.map((client) => client.name),
            successes,
            errors,
            };
  });


}

function insertIntoDatabase(clientName, data) {
  console.log(clientName + ': fetched ' + data.length + ' entities');
  data.forEach((entity) => {
    entity.updatedAt = Date.now();
    entity._id = clientName + '/' + entity.originId;
    entity.client = clientName;
  });

  var removePromise = contentModel.remove({client: clientName}).exec();

  return removePromise.then(
      (result) => console.log(clientName + ': deleted ' + result + ' rows in db')
    ).then(
      () => contentModel.collection.insert(data, { ordered: false })
    ).then(
      (result) => console.log(clientName + ': inserted ' + result.insertedCount + ' rows to db')
    );
}
