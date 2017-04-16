/* @flow */

import * as fs from 'async-file';
import assert from 'assert';
import mongodb from 'mongodb';
import path from 'path';

import AccessTokenInfo from './access_token_info';
import AppLoader from './app_loader';
import FitbitApp from './app';
import FitbitClient from './client';
import type {FitbitCompetitor} from './fitbit_competitor';

function getTeamOneCompetitors(
  competitors: Array<FitbitCompetitor>,
): Array<FitbitCompetitor> {
  return competitors.filter((competitor: FitbitCompetitor) => {
    return competitor.profile.user.encodedId === '256YMG' ||
      competitor.profile.user.encodedId === '2WMQDP' ||
      competitor.profile.user.encodedId === '2Z8TC2' ||
      competitor.profile.user.encodedId === '33694V' ||
      competitor.profile.user.encodedId === '3C3F9G';
  });
}

function getTeamTwoCompetitors(
  competitors: Array<FitbitCompetitor>,
): Array<FitbitCompetitor> {
  return competitors.filter((competitor: FitbitCompetitor) => {
    return competitor.profile.user.encodedId === '2XCGBN' ||
      competitor.profile.user.encodedId === '4C7CC5' ||
      competitor.profile.user.encodedId === '2WRBR6' ||
      competitor.profile.user.encodedId === '4CBZRP' ||
      competitor.profile.user.encodedId === '4BPPZQ';
  });
}

/**
 * Fetches data from each Fitbit client
 */
export default class FitbitClientManager {
  clients: Array<FitbitClient>;
  database: ?Object;

  constructor() {
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
            const clients: Array<FitbitClient> = await this._transformJsonObjectsToFitbitClients(
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

    return {
      competitors: competitors,
      teams: [
        {
          name: 'Team One',
          competitors: getTeamOneCompetitors(competitors),
        },
        {
          name: 'Team Two',
          competitors: getTeamTwoCompetitors(competitors),
        },
      ],
    };
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
        if (err) throw err;
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

  async _transformJsonObjectsToFitbitClients(
    jsonObjects: Array<Object>,
  ): Promise<Array<FitbitClient>> {
    const fitbitApp: FitbitApp = await AppLoader.loadAppData();
    return jsonObjects.map((client: Object) => {
      const fitbitClient: FitbitClient = new FitbitClient(fitbitApp, this);
      fitbitClient._setAccessTokenInfo(client);
      return fitbitClient;
    });
  }
}
