/* @flow */

import path from 'path';

import AppLoader from './app_loader';
import FitbitApp from './app';
import FitbitClient from './client';
import FitbitClientManager from './client_manager';
import JsonLoader from './json_loader';

const ACCESS_TOKEN_FILE: string = path.join(
  __dirname,
  '../json/access_token.json',
);

/**
 * Loads local Fitbit clients
 */
export default class FitbitClientLoader {
  static async loadLocalClients(
    fitbitClientManager: FitbitClientManager,
  ): Promise<Array<FitbitClient>> {
    const fitbitApp: FitbitApp = await AppLoader.loadAppData();
    const jsonData: Object = await JsonLoader.loadJsonAtFilePath(
      ACCESS_TOKEN_FILE,
    );

    const accessTokenInfos: Array<Object> = jsonData.access_tokens;
    return accessTokenInfos.map((access_token_info: Object) => {
      const client: FitbitClient = new FitbitClient(
        fitbitApp,
        fitbitClientManager,
      );
      client.setAccessTokenInfo(access_token_info);
      return client;
    });
  }
}
