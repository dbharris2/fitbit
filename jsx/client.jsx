/* @flow */

import FitbitApiClient from 'fitbit-node';
import * as fs from 'async-file';
import assert from 'assert';
import path from 'path';

require('babel-polyfill');

const ACCESS_TOKEN_FILE = path.join(__dirname, '../json/access_token.json');

type AccessTokenInfo = {
  access_token: string,
  refresh_token: string,
  user_id: string,
};

/**
 * Fetches data from Fitbit
 */
export default class FitbitClient {
  accessToken: string;
  client: FitbitApiClient;
  refreshToken: string;
  userId: string;

  constructor(clientId: string, clientSecret: string) {
    assert(clientId != null);
    assert(clientSecret != null);
    this.client = new FitbitApiClient(clientId, clientSecret);
    this._fetchExistingAccessTokenIfExists();
  }

  /**
   * See {@link https://dev.fitbit.com/docs/oauth2/#access-token-request Fitbit Access Token Request}
   * for more information
   */
  async getAccessToken(code: string, callbackUrl: string) {
    assert(code != null);
    assert(callbackUrl != null);
    const accessTokenInfo = await this.client.getAccessToken(code, callbackUrl);
    this._setAccessTokenInfo(accessTokenInfo);
    return accessTokenInfo;
  }

  /**
   * See {@link https://dev.fitbit.com/docs/activity/#activity-time-series Fitbit Activity Time Series Documentation}
   * for more information
   */
  async getActivityTimeSeries(
    resourcePath: string,
    baseDate: string,
    endDate: string,
  ) {
    const activityTimeSeries: Object = this._getActivityTimeSeries(
      resourcePath,
      baseDate,
      endDate,
    );
    if (this._refreshAccessTokenIfNeeded(activityTimeSeries)) {
      return await this._getActivityTimeSeries(resourcePath, baseDate, endDate);
    } else {
      return activityTimeSeries;
    }
  }

  /**
   * See {@link https://dev.fitbit.com/docs/oauth2/ Fitbit Authorization Documentation}
   * for more information
   */
  getAuthorizeUrl(callbackUrl: string) {
    assert(callbackUrl != null);
    return this.client.getAuthorizeUrl(
      'activity heartrate location profile settings sleep social',
      callbackUrl,
    );
  }

  /**
   * See {@link https://dev.fitbit.com/docs/user/#get-profile Fitbit Profile Documentation}
   * for more information
   */
  async getProfile() {
    var profile: Object = await this._getProfile();
    if (this._refreshAccessTokenIfNeeded(profile)) {
      return await this._getProfile();
    } else {
      return profile;
    }
  }

  _assertValidAccessTokenInfo(accessTokenInfo: AccessTokenInfo) {
    assert(accessTokenInfo.access_token != null);
    assert(accessTokenInfo.refresh_token != null);
    assert(accessTokenInfo.user_id != null);
  }

  async _fetchExistingAccessTokenIfExists() {
    const accessTokenInfo: AccessTokenInfo = await this._fetchLocalJson(
      ACCESS_TOKEN_FILE,
    );
    this._setAccessTokenInfo(accessTokenInfo);
  }

  async _fetchLocalJson(filePathToJson: string) {
    const json: Object = await fs.readFile(filePathToJson);
    return JSON.parse(String(json));
  }

  async _getActivityTimeSeries(
    resourcePath: string,
    baseDate: string,
    endDate: string,
  ) {
    assert(resourcePath != null);
    assert(baseDate != null);
    assert(endDate != null);
    const activityTimeSeries: Object = await this.client.get(
      '/' + resourcePath + '/date/' + baseDate + '/' + endDate + '.json',
      this.accessToken,
      this.userId,
    );
    return activityTimeSeries[0];
  }

  async _getProfile() {
    const profile: Object = await this.client.get(
      '/profile.json',
      this.accessToken,
      this.userId,
    );
    return profile[0];
  }

  _isAccessTokenExpired(response: Object) {
    assert(response != null);
    console.log('Error: ' + response.errors[0].errorType);
    return response.errors[0].errorType === 'expired_token';
  }

  /**
   * See {@link https://dev.fitbit.com/docs/oauth2/#refreshing-tokens Fitbit Refreshing Tokens Documentation}
   * for more information
   */
  async _refreshAccessToken() {
    console.log('Refreshing access token');
    const accessTokenInfo: AccessTokenInfo = await this.client.refreshAccessToken(
      this.accessToken,
      this.refreshToken,
      -1,
    );
    console.log(accessTokenInfo);
    this._setAccessTokenInfo(accessTokenInfo);
  }

  async _refreshAccessTokenIfNeeded(response: Object) {
    if (this._isAccessTokenExpired(response)) {
      console.log('Access token is expired, need to refresh');
      await this._refreshAccessToken();
      return true;
    } else {
      return false;
    }
  }

  _setAccessTokenInfo(accessTokenInfo: AccessTokenInfo) {
    this._assertValidAccessTokenInfo(accessTokenInfo);
    this.accessToken = accessTokenInfo.access_token;
    this.refreshToken = accessTokenInfo.refresh_token;
    this.userId = accessTokenInfo.user_id;
    this._storeAccessTokenInfo(accessTokenInfo);
  }

  _storeAccessTokenInfo(accessTokenInfo: AccessTokenInfo) {
    console.log('Storing access token');
    this._assertValidAccessTokenInfo(accessTokenInfo);
    fs.writeFile(ACCESS_TOKEN_FILE, JSON.stringify(accessTokenInfo));
  }
}
