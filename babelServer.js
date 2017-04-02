import express from 'express'
import fs from 'fs'
import path from 'path'

import FitbitClient from './jsx/client'

const ACCESS_TOKEN_FILE = path.join(__dirname, 'json/access_token.json')
const APP_FILE = path.join(__dirname, 'json/app.json')
const FITBIT_AUTHORIZATION_CALLBACK_URL = 'https://localhost:8080/fitbit-callback'

const app = express()

app.set('port', (process.env.PORT || 8080))
app.use('/', express.static(path.join(__dirname, 'public')))

createJsonEndpoints(app, '/access-token', ACCESS_TOKEN_FILE)
createJsonEndpoints(app, '/app', APP_FILE)

app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname + './public/index.html'))
})

// TODO: Make the date configurable. Probably want a post request for that.
app.get('/activity', (req, res) => {
  createFitbitClient((fitbitClient) => {
    fitbitClient.getActivity('2016-05-10', (results) => {
      const data = results[0]
      res.json(data)
    })
  })
})

// TODO: Make the dates configurable. Probably want a post request for that.
app.get('/activity-time-series', (req, res) => {
  createFitbitClient((fitbitClient) => {
    fitbitClient.getActivityTimeSeries('activities/steps', '2016-05-10', '2016-05-17', (results) => {
      console.log(results)
      const data = results[0]
      res.json(data)
    })
  })
})

app.get('/authenticate', (req, res) => {
  createFitbitClient((fitbitClient) => {
    const authorizeUrl = fitbitClient.getAuthorizeUrl(
      'activity heartrate location nutrition profile settings sleep social',
      FITBIT_AUTHORIZATION_CALLBACK_URL,
    )
    res.redirect(authorizeUrl)
  })
})

app.get('/fitbit-callback', (req, res) => {
  createFitbitClient((fitbitClient) => {
    fitbitClient.getAccessToken(
      req.query.code,
      FITBIT_AUTHORIZATION_CALLBACK_URL,
      (result) => {
        // TODO: Store the access token and redirect to a valid url
        console.log(JSON.stringify(result))
        console.log('Access token: ' + result.access_token)
        res.redirect('/')
      },
      (error) => { res.send(error) })
  })
})

app.get('/profile', (req, res) => {
  createFitbitClient((fitbitClient) => {
    fitbitClient.getProfile((results) => {
      const data = results[0]
      res.json(data)
    })
  })
})

app.listen(app.get('port'), () => {
  console.log('Server started: http://localhost:' + app.get('port') + '/')
})

function createFitbitClient(onCreate) {
  fetchJson(APP_FILE, (appData) => {
    fetchJson(ACCESS_TOKEN_FILE, (jsonData) => {
      const client = new FitbitClient(
        appData.client_id,
        appData.client_secret,
        jsonData.access_token,
        jsonData.user_id,
      )
      onCreate(client)
    })
  })
}

function createJsonEndpoints(app, apiPath, filePath) {
  app.get(apiPath, (req, res) => {
    fetchJson(filePath, (jsonData) => {
      res.json(jsonData)
    });
  });
}

function fetchJson(filePathToJson, onFetch) {
  fs.readFile(filePathToJson, (err, data) => {
    if (err) {
      console.error(err)
      process.exit(1)
    } else {
      onFetch(JSON.parse(data))
    }
  });
}
