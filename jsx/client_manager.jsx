/* @flow */

import * as fs from 'async-file';
import assert from 'assert';
import path from 'path';

import AccessTokenInfo from './access_token_info';
import FitbitClient from './client';
import type {FitbitCompetitor} from './fitbit_competitor';

const ACCESS_TOKEN_FILE: string = path.join(
  __dirname,
  '../json/access_token.json',
);

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
      competitor.profile.user.encodedId === 'Emma';
  });
}

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
        client.replaceAccessTokenInfo(fitbitClient.getAccessTokenInfo());
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
        getTeamOneCompetitors(competitors),
        getTeamTwoCompetitors(competitors),
      ],
    };
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

    if (accessTokens.length > 0) {
      fs.writeFile(ACCESS_TOKEN_FILE, JSON.stringify(accessTokenInfos));
    }
  }
}
