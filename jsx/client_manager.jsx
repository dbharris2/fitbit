/* @flow */

import * as fs from 'async-file';
import assert from 'assert';
import path from 'path';

import AccessTokenInfo from './access_token_info';
import FitbitClient from './client';

const ACCESS_TOKEN_FILE: string = path.join(
  __dirname,
  '../json/access_token.json',
);

/**
 * Fetches data from each Fitbit client
 */
export default class FitbitClientManager {
  clients: Array<FitbitClient>;

  constructor() {
    this.clients = [];
  }

  addClient(fitbitClient: FitbitClient): void {
    assert(fitbitClient != null);

    console.log('Adding a new fitbit client for user id');
    console.log(fitbitClient.getAccessTokenInfo().getUserId());
    var inserted = false;
    this.clients.forEach((client: FitbitClient) => {
      console.log(client.getAccessTokenInfo().getUserId());
      if (
        fitbitClient.getAccessTokenInfo().getUserId() ===
        client.getAccessTokenInfo().getUserId()
      ) {
        client.replaceAccessTokenInfo(fitbitClient.getAccessTokenInfo());
        inserted = true;
        console.log('Replaced client');
      }
    });

    if (!inserted) {
      this.clients.push(fitbitClient);
      console.log('Pushed a new client');
    }
  }

  addClients(fitbitClients: Array<FitbitClient>): void {
    assert(fitbitClients != null);
    fitbitClients.forEach((fitbitClient: FitbitClient) => {
      this.addClient(fitbitClient);
    });
  }

  async getCompetitors(
    resourcePath: string,
    baseDate: string,
    endDate: string,
  ): Promise<Array<Object>> {
    const activityTimeSeriesPromises: Array<Promise<Object>> = this.clients.map(
      (client: FitbitClient) => {
        return client.getCompetitors(resourcePath, baseDate, endDate);
      },
    );
    return await Promise.all(activityTimeSeriesPromises);
  }

  saveClients() {
    console.log('Saving clients');
    const accessTokenInfos: Object = {access_tokens: []};
    const accessTokens: Array<Object> = accessTokenInfos['access_tokens'];

    this.clients.forEach((client: FitbitClient) => {
      const accessTokenInfo: AccessTokenInfo = client.getAccessTokenInfo();
      accessTokens.push({
        access_token: accessTokenInfo.getAccessToken(),
        refresh_token: accessTokenInfo.getRefreshToken(),
        user_id: accessTokenInfo.getUserId(),
      });
    });

    if (accessTokens.length > 0) {
      console.log(accessTokenInfos);
      fs.writeFile(ACCESS_TOKEN_FILE, JSON.stringify(accessTokenInfos));
    }
  }
}
