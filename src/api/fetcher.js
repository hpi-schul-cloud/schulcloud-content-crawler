'use strict';

import contentModel from '../models/contents';
let clientNames = ['antares', 'khanacademy', 'serlo'];
let clients = {};
clientNames.forEach((client) => clients[client] = require('../clients/' + client)); 

import _ from 'lodash';
import md5 from 'md5';

export default ({ api }) => {
  api.get('/fetch', (req, res) => {
    let excludedClients = Array.isArray(req.query.exclude) ? req.query.exclude : [req.query.exclude];
    fetchData(excludedClients).then( (data) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(data));
    });
  });
};

//fetching all data from every client and push the data to the database
function fetchData (excludedClients) {
  let errors = [];
  let fetchClients = _.keys(clients).filter((client) => !excludedClients.includes(client));
  let clientsPromises = fetchClients
    .map((client) =>
      clients[client].getAll()
          .then((data) => insertIntoDatabase(client, data))
          .catch((error) => {
            console.error(client + ' failed with error:' + error);
            errors.push({client: client, error: error});
          })
    );

  console.log('Will fetch data from ' + clientsPromises.length + ' client(s)');
  return Promise.all(clientsPromises).then((data) => {
    let successes = _.values(fetchClients)
                  .filter((client) => errors.filter((error) => error.client === client).length == 0)
                  .map((client) => client);
    let text = successes.length + '/' + fetchClients.length + ' client(s) successfully fetched data';
    
    console.log(text);
    return {
        message: text,
        clients: _.values(fetchClients),
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
    );
}
