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
  fs.readFile(APP_FILE, function(err, data) {
    if (err) {
      console.error(err);
      process.exit(1);
    }

    const appData = JSON.parse(data);

    client = new FitbitApiClient(appData.client_id, appData.client_secret);

    const authorizeUrl = client.getAuthorizeUrl(
      'activity heartrate location nutrition profile settings sleep social',
      FITBIT_AUTHORIZATION_CALLBACK_URL
    );

    res.redirect(authorizeUrl);
  });
});

app.get('/fitbit-callback', function(req, res) {
  client.getAccessToken(req.query.code, FITBIT_AUTHORIZATION_CALLBACK_URL).then(function(result) {
    // TODO: Store the access token and redirect to a valid url
    console.log(JSON.stringify(result));
    console.log('Access token: ' + result.access_token);
    res.redirect('/');
  }).catch(function(error) {
    res.send(error);
  });
});

app.listen(app.get('port'), function() {
  console.log('Server started: http://localhost:' + app.get('port') + '/');
});

function createJsonEndpoints(app, apiPath, filePath) {
  app.get(apiPath, function(req, res) {
    fs.readFile(filePath, function(err, data) {
      if (err) {
        console.error(err);
        process.exit(1);
      } else {
        res.json(JSON.parse(data));
      }
    });
  });
}
