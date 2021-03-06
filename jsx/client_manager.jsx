/* @flow */

import * as fs from 'async-file';
import assert from 'assert';
import mongodb from 'mongodb';
import path from 'path';

import AccessTokenInfo from './access_token_info';
import FitbitClient from './client';
import type {FitbitCompetitor} from './fitbit_competitor';

function getTeamOneCompetitors(
  competitors: Array<FitbitCompetitor>,
): Array<FitbitCompetitor> {
  return competitors.filter((competitor: FitbitCompetitor) => {
    return competitor.profile.user.encodedId === '256YMG' ||
      competitor.profile.user.encodedId === '2WMQDP' ||
      competitor.profile.user.encodedId === '2XCGBN' ||
      competitor.profile.user.encodedId === '4BPPZQ';
  });
}

function getTeamTwoCompetitors(
  competitors: Array<FitbitCompetitor>,
): Array<FitbitCompetitor> {
  return competitors.filter((competitor: FitbitCompetitor) => {
    return competitor.profile.user.encodedId === '4C7CC5' ||
      competitor.profile.user.encodedId === '2WRBR6' ||
      competitor.profile.user.encodedId === '3C3F9G' ||
      competitor.profile.user.encodedId === '5MSHQS';
  });
}

function getTotalStepsForCompetitors(
  competitors: Array<FitbitCompetitor>,
): number {
  var totalSteps: number = 0;
  competitors.forEach((competitor: FitbitCompetitor, index: number) => {
    competitor.activityTimeSeries.forEach((steps: Array<String>) => {
      const stepCount: String = steps[1];
      totalSteps += parseInt(stepCount);
    });
  });
  return totalSteps;
}

function findDifferenceTimeSeries(
  seriesOne: Array<Array<String>>,
  seriesTwo: Array<Array<String>>,
): Array<Array<String>> {
  const differenceActivityTimeSeries: Array<Array<String>> = [];
  for (var i = 0; i < seriesOne.length; i++) {
    const item1 = seriesOne[i];
    const item2 = seriesTwo[i];
    differenceActivityTimeSeries.push([
      item1[0],
      new String(parseInt(item1[1]) - parseInt(item2[1])),
    ]);
  }
  return differenceActivityTimeSeries;
}

function getTotalActivityTimeSeriesForCompetitors(
  competitors: Array<FitbitCompetitor>,
): Array<Array<String>> {
  const dates: Array<String> = [];
  const totalActivityTimeSeries: Object = {};

  competitors.forEach((competitor: FitbitCompetitor, index: number) => {
    var competitorTotalSteps: number = 0;
    competitor.activityTimeSeries.forEach((steps: Array<String>) => {
      const date: String = steps[0];
      dates.push(date);

      if (totalActivityTimeSeries[date] == null) {
        totalActivityTimeSeries[date] = '0';
      }

      const stepCount: String = steps[1];
      competitorTotalSteps += parseInt(stepCount);

      totalActivityTimeSeries[date] = new String(
        parseInt(totalActivityTimeSeries[date]) +
          parseInt(competitorTotalSteps),
      );
    });
  });

  const formattedActivityTimeSeries: Array<Array<String>> = [];
  dates.forEach((date: String) => {
    formattedActivityTimeSeries.push([date, totalActivityTimeSeries[date]]);
  });
  return formattedActivityTimeSeries;
}

/**
 * Fetches data from each Fitbit client
 */
export default class FitbitClientManager {
  cachedCompetition: ?Object;
  clientId: String;
  clientSecret: String;
  clients: Array<FitbitClient>;
  database: ?Object;

  constructor(clientId: String, clientSecret: String) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.clients = [];
    this.database = null;
  }

  addClient(fitbitClient: FitbitClient): void {
    assert(fitbitClient != null);

    const localClient: ?FitbitClient = this._getClientWithUserId(
      fitbitClient.getUserId(),
    );

    if (localClient == null) {
      this._addClient(fitbitClient);
    } else {
      this.updateClient(fitbitClient);
    }
  }

  addClients(fitbitClients: Array<FitbitClient>): void {
    assert(fitbitClients != null);
    fitbitClients.forEach((fitbitClient: FitbitClient) => {
      this.addClient(fitbitClient);
    });
  }

  async loadExistingClients(): Promise<void> {
    if (this.database != null) {
      this.database
        .collection('users')
        .find({})
        .toArray(async (err: Object, docs: Array<Object>) => {
          if (err) {
            console.log(err);
          } else {
            const clients: Array<FitbitClient> = this._transformJsonObjectsToFitbitClients(
              docs,
            );
            clients.forEach((client: FitbitClient) => {
              this.clients.push(client);
            });
          }
        });
    }
  }

  async getCompetitors(
    resourcePath: string,
    baseDate: string,
    endDate: string,
  ): Promise<Array<FitbitCompetitor>> {
    const competitorPromises: Array<Promise<FitbitCompetitor>> = this.clients.map(
      (client: FitbitClient) => {
        return client.getCompetitor(resourcePath, baseDate, endDate);
      },
    );
    return await Promise.all(competitorPromises);
  }

  getCachedCompetition(): ?Object {
    return this.cachedCompetition;
  }

  async getCompetition(
    resourcePath: string,
    baseDate: string,
    endDate: string,
  ): Promise<Object> {
    const competitors: Array<FitbitCompetitor> = await this.getCompetitors(
      resourcePath,
      baseDate,
      endDate,
    );

    const teamOneCompetitors: Array<FitbitCompetitor> = getTeamOneCompetitors(
      competitors,
    );
    const teamTwoCompetitors: Array<FitbitCompetitor> = getTeamTwoCompetitors(
      competitors,
    );

    const teamOneTotalSteps: number = getTotalStepsForCompetitors(
      teamOneCompetitors,
    );
    const teamTwoTotalSteps: number = getTotalStepsForCompetitors(
      teamTwoCompetitors,
    );

    const teamOneActivity = getTotalActivityTimeSeriesForCompetitors(
      teamOneCompetitors,
    );
    const teamTwoActivity = getTotalActivityTimeSeriesForCompetitors(
      teamTwoCompetitors,
    );

    const competition: Object = {
      differenceActivityTimeSeries: findDifferenceTimeSeries(
        teamOneActivity,
        teamTwoActivity,
      ),
      competitors: competitors,
      teams: [
        {
          name: 'Sole Survivors',
          competitors: teamOneCompetitors,
          isWinning: teamOneTotalSteps >= teamTwoTotalSteps,
          totalSteps: teamOneTotalSteps,
          activityTimeSeries: {
            name: 'Sole Survivors',
            data: teamOneActivity,
          },
        },
        {
          name: 'The Unamazing Racers',
          competitors: teamTwoCompetitors,
          isWinning: teamOneTotalSteps < teamTwoTotalSteps,
          totalSteps: teamTwoTotalSteps,
          activityTimeSeries: {
            name: 'The Unamazing Racers',
            data: teamTwoActivity,
          },
        },
      ],
    };

    this.cachedCompetition = competition;
    return competition;
  }

  setDatabase(database: Object) {
    this.database = database;
  }

  updateClient(client: FitbitClient): void {
    console.log('Updating client: ' + client.getUserId());
    if (this.database != null) {
      this.database.collection('users').updateOne({
        user_id: client.accessTokenInfo.getUserId(),
      }, {
        access_token: client.accessTokenInfo.getAccessToken(),
        refresh_token: client.accessTokenInfo.getRefreshToken(),
        user_id: client.accessTokenInfo.getUserId(),
      }, (err, doc) => {
        if (err) {
          console.log(err);
        }

        const clientToUpdate: ?FitbitClient = this._getClientWithUserId(
          client.getUserId(),
        );
        if (clientToUpdate) {
          console.log(
            'Replacing access token for client: ' + client.getUserId(),
          );
          clientToUpdate.replaceAccessTokenInfo(client.getAccessTokenInfo());
        }
      });
    }
  }

  _addClient(client: FitbitClient) {
    console.log('Adding client: ' + client.getUserId());
    if (this.database != null) {
      this.database.collection('users').insertOne({
        access_token: client.accessTokenInfo.getAccessToken(),
        refresh_token: client.accessTokenInfo.getRefreshToken(),
        user_id: client.accessTokenInfo.getUserId(),
      }, (err, doc) => {
        if (err) return null;
        this.clients.push(client);
      });
    }
  }

  _getClientWithUserId(userId: string): ?FitbitClient {
    this.clients.forEach((client: FitbitClient) => {
      if (userId === client.getAccessTokenInfo().getUserId()) {
        return client;
      }
    });
    return null;
  }

  _transformJsonObjectsToFitbitClients(
    jsonObjects: Array<Object>,
  ): Array<FitbitClient> {
    return jsonObjects.map((client: Object) => {
      const fitbitClient: FitbitClient = new FitbitClient(
        this.clientId,
        this.clientSecret,
        this,
      );
      fitbitClient._setAccessTokenInfo(client);
      return fitbitClient;
    });
  }
}
