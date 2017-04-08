/* @flow */

import express from 'express';
import * as fs from 'async-file';
import path from 'path';

import FitbitClient from './jsx/client';

const APP_FILE = path.join(__dirname, 'json/app.json');
const FITBIT_AUTHORIZATION_CALLBACK_URL = 'https://localhost:8080/fitbit-callback';

const app = express();

app.set('port', process.env.PORT || 8080);
app.use('/', express.static(path.join(__dirname, 'public')));

var fitbitClient = null;
createFitbitClient(client => {
  fitbitClient = client;
});

app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname + './public/index.html'));
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

app.get('/app', async (req, res) => {
  const jsonData: Object = await fetchLocalJson(APP_FILE);
  res.json(jsonData);
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

async function createFitbitClient(onCreate) {
  const appData: Object = await fetchLocalJson(APP_FILE);
  const client: FitbitClient = new FitbitClient(
    appData.client_id,
    appData.client_secret,
  );
  onCreate(client);
}

async function fetchLocalJson(filePathToJson) {
  const json: Object = await fs.readFile(filePathToJson);
  return JSON.parse(String(json));
}
