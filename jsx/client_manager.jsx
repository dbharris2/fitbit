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

    var inserted = false;
    this.clients.forEach((client: FitbitClient) => {
      if (
        fitbitClient.getAccessTokenInfo().getUserId() ===
        client.getAccessTokenInfo().getUserId()
      ) {
        client.setAccessTokenInfo(fitbitClient.getAccessTokenInfo());
        inserted = true;
      }
    });

    if (!inserted) {
      this.clients.push(fitbitClient);
    }

    this.saveClients();
  }

  addClients(fitbitClients: Array<FitbitClient>): void {
    assert(fitbitClients != null);
    fitbitClients.forEach((fitbitClient: FitbitClient) => {
      this.addClient(fitbitClient);
    });
  }

  async getAllActivityTimeSeries(
    resourcePath: string,
    baseDate: string,
    endDate: string,
  ): Promise<Array<Object>> {
    const activityTimeSeriesPromises: Array<Promise<Object>> = this.clients.map(
      (client: FitbitClient) => {
        return client.getActivityTimeSeries(resourcePath, baseDate, endDate);
      },
    );
    return await Promise.all(activityTimeSeriesPromises);
  }

  async getAllProfiles(): Promise<Array<Object>> {
    const profilePromises: Array<Promise<Object>> = this.clients.map(
      (client: FitbitClient) => {
        return client.getProfile();
      },
    );
    return await Promise.all(profilePromises);
  }

  saveClients() {
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

    console.log(accessTokenInfos);
    fs.writeFile(ACCESS_TOKEN_FILE, JSON.stringify(accessTokenInfos));
  }
}
