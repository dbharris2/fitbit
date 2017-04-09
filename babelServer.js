/* @flow */

import * as fs from 'async-file';
import express from 'express';
import path from 'path';

import AppLoader from './jsx/app_loader';
import FitbitApp from './jsx/app';
import FitbitClient from './jsx/client';
import FitbitClientLoader from './jsx/client_loader';
import FitbitClientManager from './jsx/client_manager';

require('babel-polyfill');

const FITBIT_AUTHORIZATION_CALLBACK_URL: string = 'https://localhost:8080/fitbit-callback';

const app: Object = express();

app.set('port', process.env.PORT || 8080);
app.use('/', express.static(path.join(__dirname, 'public')));

const fitbitClientManager: FitbitClientManager = new FitbitClientManager();

app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname + './public/index.html'));
});

app.get('/activity-time-series', async (req, res) => {
  const allActivityTimeSeries: Array<Object> = await fitbitClientManager.getAllActivityTimeSeries(
    'activities/steps',
    '2016-05-10',
    '2016-05-17',
  );
  res.json(allActivityTimeSeries);
});

app.get('/authenticate', async (req, res) => {
  const client: FitbitClient = await createFitbitClient();
  const authorizeUrl: string = client.getAuthorizeUrl(
    FITBIT_AUTHORIZATION_CALLBACK_URL,
  );
  res.redirect(authorizeUrl);
});

app.get('/fitbit-callback', async (req, res) => {
  const client: FitbitClient = await createFitbitClient();
  await client.setAccessToken(
    req.query.code,
    FITBIT_AUTHORIZATION_CALLBACK_URL,
  );
  fitbitClientManager.addClient(client);
  res.redirect('/');
});

app.get('/profile', async (req, res) => {
  const profiles: Array<Object> = await fitbitClientManager.getAllProfiles();
  res.json(profiles);
});

app.listen(app.get('port'), async () => {
  const localFitbitClients: Array<FitbitClient> = await FitbitClientLoader.loadLocalClients();
  fitbitClientManager.addClients(localFitbitClients);
  console.log('Server started: http://localhost:' + app.get('port') + '/');
});

async function createFitbitClient() {
  const fitbitApp: FitbitApp = await AppLoader.loadAppData();
  return new FitbitClient(fitbitApp);
}
