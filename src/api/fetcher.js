'use strict';

import contentModel from '../models/contents';
let clientNames = ['antares', 'khanacademy', 'serlo'];
let clients = {};
clientNames.forEach((client) => clients[client] = require('../clients/' + client)); 

import _ from 'lodash';
import md5 from 'md5';

export default ({ api }) => {
  api.get('/fetch', (req, res) => {
    fetchData().then( (data) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(data));
    });
  });
};

//fetching all data from every client and push the data to the database
function fetchData () {
  let errors = [];
  let clientsPromises = _.keys(clients)
    .map((client) =>
      clients[client].getAll()
          .then((data) => insertIntoDatabase(client, data))
          .catch((error) => {
            console.error(client + ' failed with error:' + error);
            errors.push({client: client, error: error});
          })
    );

  console.log('Will fetch data from ' + clientsPromises.length + ' clients');
  return Promise.all(clientsPromises).then((data) => {
    let successes = _.keys(clients)
                  .filter((client) => errors.filter((error) => error.client === client).length == 0)
                  .map((client) => client);
    let text = successes.length + '/' + _.keys(clients).length + ' clients successfully fetched data';
    
    console.log(text);
    return {
        message: text,
        clients: _.keys(clients),
        successes,
        errors
    };
  });
}

function insertIntoDatabase(clientName, data) {
  console.log(clientName + ': fetched ' + data.length + ' entities');
  data.forEach((entity) => {
    entity.updatedAt = Date.now();
    entity._id = md5(clientName + '_' + entity.originId).slice(4,28);    
    entity.id = md5(clientName + '_' + entity.originId).slice(4,28); 
    entity.type = "contents";   //needed for jsonapi-server
    entity.client = clientName;
  });

  let removePromise = contentModel.remove({client: clientName}).exec();

  return removePromise.then(
      (result) => console.log(clientName + ': deleted ' + result + ' rows in db')
    ).then(
      () => contentModel.collection.insert(data, { ordered: false })
    ).then(
      (result) => console.log(clientName + ': inserted ' + result.insertedCount + ' rows to db')
    ).catch(
      (error) => console.log(error)
    );
}
