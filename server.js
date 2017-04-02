const express = require('express');
const fs = require( 'fs' );
const path = require('path');

const FitbitApiClient = require('fitbit-node');

const ACCESS_TOKEN_FILE = path.join(__dirname, 'json/access_token.json');
const APP_FILE = path.join(__dirname, 'json/app.json');
const FITBIT_AUTHORIZATION_CALLBACK_URL = 'https://localhost:8080/fitbit-callback';

const app = express();

app.set('port', (process.env.PORT || 8080));
app.use('/', express.static(path.join(__dirname, 'public')));

createJsonEndpoints(app, '/access-token', ACCESS_TOKEN_FILE);
createJsonEndpoints(app, '/app', APP_FILE);

var client;

app.get('/authenticate', function(req, res) {
  createFitbitApiClient(function(fitbitApiClient) {
    const authorizeUrl = fitbitApiClient.getAuthorizeUrl(
      'activity heartrate location nutrition profile settings sleep social',
      FITBIT_AUTHORIZATION_CALLBACK_URL
    );
    res.redirect(authorizeUrl);
  });
});

app.get('/fitbit-callback', function(req, res) {
  createFitbitApiClient(function(fitbitApiClient) {
    fitbitApiClient.getAccessToken(req.query.code, FITBIT_AUTHORIZATION_CALLBACK_URL).then(function(result) {
      // TODO: Store the access token and redirect to a valid url
      console.log(JSON.stringify(result));
      console.log('Access token: ' + result.access_token);
      res.redirect('/');
    }).catch(function(error) {
      res.send(error);
    });
  });
});

app.get('/profile', function(req, res) {
  createFitbitApiClient(function(fitbitApiClient) {
    fetchJson(ACCESS_TOKEN_FILE, function(jsonData) {
      fitbitApiClient.get('/profile.json', jsonData.access_token).then(function(results) {
        const data = results[0];
        res.json(data);
      });
    });
  });
});

app.listen(app.get('port'), function() {
  console.log('Server started: http://localhost:' + app.get('port') + '/');
});

function createFitbitApiClient(onCreate) {
  fetchJson(APP_FILE, function(appData) {
    const client = new FitbitApiClient(appData.client_id, appData.client_secret);
    onCreate(client);
  });
}

function createJsonEndpoints(app, apiPath, filePath) {
  app.get(apiPath, function(req, res) {
    fetchJson(filePath, function(jsonData) {
      res.json(jsonData);
    });
  });
}

function fetchJson(filePathToJson, onFetch) {
  fs.readFile(filePathToJson, function(err, data) {
    if (err) {
      console.error(err);
      process.exit(1);
    } else {
      onFetch(JSON.parse(data));
    }
  });
}
