/* @flow */

import express from 'express';
import fs from 'fs';
import path from 'path';

import FitbitClient from './jsx/client';

const ACCESS_TOKEN_FILE = path.join(__dirname, 'json/access_token.json');
const APP_FILE = path.join(__dirname, 'json/app.json');
const FITBIT_AUTHORIZATION_CALLBACK_URL = 'https://localhost:8080/fitbit-callback';

const app = express();

app.set('port', process.env.PORT || 8080);
app.use('/', express.static(path.join(__dirname, 'public')));

createLocalJsonEndpoints(app, '/access-token', ACCESS_TOKEN_FILE);
createLocalJsonEndpoints(app, '/app', APP_FILE);

var fitbitClient = null;
createFitbitClient(client => {
  fitbitClient = client;
});

app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname + './public/index.html'));
});

// TODO: Make the date configurable. Probably want a post request for that.
app.get('/activity', async (req, res) => {
  if (fitbitClient) {
    const activity = await fitbitClient.getActivity('2016-05-10');
    res.json(activity);
  }
});

// TODO: Make the dates configurable. Probably want a post request for that.
app.get('/activity-time-series', async (req, res) => {
  if (fitbitClient) {
    const activityTimeSeries = await fitbitClient.getActivityTimeSeries(
      'activities/steps',
      '2016-05-10',
      '2016-05-17',
    );
    res.json(activityTimeSeries);
  }
});

app.get('/authenticate', (req, res) => {
  if (fitbitClient) {
    const authorizeUrl = fitbitClient.getAuthorizeUrl(
      FITBIT_AUTHORIZATION_CALLBACK_URL,
    );
    res.redirect(authorizeUrl);
  }
});

app.get('/fitbit-callback', async (req, res) => {
  if (fitbitClient) {
    const accessTokenInfo = await fitbitClient.getAccessToken(
      req.query.code,
      FITBIT_AUTHORIZATION_CALLBACK_URL,
    );
    fs.writeFile('json/access_token.json', JSON.stringify(accessTokenInfo));
    res.redirect('/');
  }
});

app.get('/profile', async (req, res) => {
  if (fitbitClient) {
    const profile = await fitbitClient.getProfile();
    res.json(profile);
  }
});

app.listen(app.get('port'), () => {
  console.log('Server started: http://localhost:' + app.get('port') + '/');
});

function createFitbitClient(onCreate) {
  fetchLocalJson(APP_FILE, appData => {
    fetchLocalJson(ACCESS_TOKEN_FILE, accessTokenInfo => {
      const client = new FitbitClient(appData.client_id, appData.client_secret);
      client.setAccessTokenInfo(accessTokenInfo);
      onCreate(client);
    });
  });
}

function createLocalJsonEndpoints(app, apiPath, filePath) {
  app.get(apiPath, (req, res) => {
    fetchLocalJson(filePath, jsonData => {
      res.json(jsonData);
    });
  });
}

function fetchLocalJson(filePathToJson, onFetch) {
  fs.readFile(filePathToJson, (err, data) => {
    if (err) {
      console.error(err);
      process.exit(1);
    } else {
      onFetch(JSON.parse(String(data)));
    }
  });
}
