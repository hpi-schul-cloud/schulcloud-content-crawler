'use strict';

import contentModel from '../models/contents';

const fs = require ('fs');

let clientNames = ['antares', 'khanacademy', 'serlo', 'youtube'];
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
      fs.createWriteStream(__dirname + '/../../fetch.log', {flags: 'a'}).write(JSON.stringify(data));
    });
  });
};

//fetching all data from every client and push the data to the database
function fetchData (excludedClients) {
  let errors = [];
  let fetchClients = _.keys(clients).filter(client => excludedClients.indexOf(client) === -1);
  let clientsPromises = fetchClients
    .map((client) =>
      clients[client].getAll()
          .then((data) => insertIntoDatabase(client, data))
          .catch((error) => {
            console.error(client + ' failed with error:' + error);
            errors.push({client: client, error: error});
          })
    );

  console.log('Will fetch data from ' + fetchClients.length + ' client(s)');
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

  let findPromise = contentModel.find({client: clientName}, {_id: true}).exec();
  return findPromise.then(result => {
      let ids = result.map(entity => entity._id);
      console.log(clientName + ': found ' + ids.length + ' existing entities');

      data.forEach(entity => {
          entity.updatedAt = Date.now();
          entity._id = md5(clientName + '_' + entity.originId).slice(4, 28);
          entity.id = md5(clientName + '_' + entity.originId).slice(4, 28);
          entity.type = "contents";   //needed for jsonapi-server
          entity.client = clientName;
          let index = ids.indexOf(entity._id);
          if (index > -1) {
              ids.splice(index, 1);
          }
      });

      let removePromise = contentModel.remove({_id: {$in: ids}}).exec();
      return removePromise
          .then(result => console.log(clientName + ': deleted ' + result.result.n + ' rows'))
          .then(() => Promise.all(data.map(entity => contentModel.update({_id: entity._id}, entity, {upsert: true}).exec())))
          .then(result => {
              console.log(clientName + ': inserted ' + result.filter(row => row.upserted !== undefined).length + ' rows');
              console.log(clientName + ': modified ' + result.filter(row => (row.upserted === undefined) && (row.nModified == 1)).length + ' rows');
          });
  });
}
