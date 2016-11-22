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

  var options = {
    Model: contentModel,
    paginate: {
      default: 5,
      max: 25
    }
  };
 
  app.use('/contents', service(options));
  app.use('/startFetching', {
    find() {
      return fetchData();
    } 
  });

  //fetchData();
};

//fetching all data from every client and push the data to the database
function fetchData () {
  var clientsPromises = clients
    .filter((client) => client.getAll !== undefined)
    .map((client) => {
      return client.getAll()
          .then((data) => insertIntoDatabase(client.name, data))
          .catch((error) => console.error(client.name + ' failed with error:' + error))
      }
    );

  console.log('Will fetch data from ' + clientsPromises.length + ' clients');
  
  return Promise.all(clientsPromises).then((data) => {
    var text = data.length + ' clients finished fetching data';
    console.log(text);
    return {message: text,
            clients: clients.filter((client) => client.getAll !== undefined).map((client) => client.name),
            succeededFetches: data.length
            };
  });


}

function insertIntoDatabase(clientName, data) {
  console.log(clientName + ': fetched ' + data.length + ' entities');
  data = data.map((learningObject) => {return {
    client: clientName,
    originId: learningObject.originId,
    title: learningObject.title,
    url: learningObject.url,
    license: learningObject.license
  }});

  var removePromise = contentModel.remove({client: clientName}).exec();
  
  return removePromise.then(
      (result) => console.log(clientName + ': deleted ' + result + ' rows in db')
    ).then(
      () => contentModel.collection.insert(data, { ordered: false })
    ).then(
      (result) => console.log(clientName + ': inserted ' + result.insertedCount + ' rows to db')
    );
}