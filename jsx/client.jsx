/* @flow */

import assert from 'assert';

import AccessTokenInfo from './access_token_info';
import FitbitApiClient from 'fitbit-node';
import FitbitApp from './app';

/**
 * Fetches data from Fitbit
 */
export default class FitbitClient {
  accessTokenInfo: AccessTokenInfo;
  client: FitbitApiClient;

  constructor(fitbitApp: FitbitApp) {
    this.client = new FitbitApiClient(
      fitbitApp.getClientId(),
      fitbitApp.getClientSecret(),
    );
  }

  getAccessTokenInfo(): AccessTokenInfo {
    return this.accessTokenInfo;
  }

  /**
   * See {@link https://dev.fitbit.com/docs/oauth2/#access-token-request Fitbit Access Token Request}
   * for more information
   */
  async setAccessToken(code: string, callbackUrl: string): Promise<void> {
    assert(code != null);
    assert(callbackUrl != null);
    const accessTokenInfo: Object = await this.client.getAccessToken(
      code,
      callbackUrl,
    );
    console.log(accessTokenInfo);
    this.setAccessTokenInfo(accessTokenInfo);
  }

  /**
   * See {@link https://dev.fitbit.com/docs/activity/#activity-time-series Fitbit Activity Time Series Documentation}
   * for more information
   */
  async getActivityTimeSeries(
    resourcePath: string,
    baseDate: string,
    endDate: string,
  ): Promise<Object> {
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
  getAuthorizeUrl(callbackUrl: string): string {
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
  async getProfile(): Promise<Object> {
    const profile: Object = await this._getProfile();
    if (this._refreshAccessTokenIfNeeded(profile)) {
      return await this._getProfile();
    } else {
      return profile;
    }
  }

  setAccessTokenInfo(accessTokenInfo: Object): void {
    assert(accessTokenInfo != null);
    this.accessTokenInfo = AccessTokenInfo.fromJson(accessTokenInfo);
  }

  async _getActivityTimeSeries(
    resourcePath: string,
    baseDate: string,
    endDate: string,
  ): Promise<Object> {
    assert(resourcePath != null);
    assert(baseDate != null);
    assert(endDate != null);
    const activityTimeSeries: Object = await this.client.get(
      '/' + resourcePath + '/date/' + baseDate + '/' + endDate + '.json',
      this.accessTokenInfo.accessToken,
      this.accessTokenInfo.userId,
    );
    return activityTimeSeries[0];
  }

  async _getProfile(): Promise<Object> {
    const profile: Object = await this.client.get(
      '/profile.json',
      this.accessTokenInfo.accessToken,
      this.accessTokenInfo.userId,
    );
    return profile[0];
  }

  static _isAccessTokenExpired(response: Object): boolean {
    assert(response != null);
    console.log('Error: ' + response.errors[0].errorType);
    return response.errors[0].errorType === 'expired_token';
  }

  /**
   * See {@link https://dev.fitbit.com/docs/oauth2/#refreshing-tokens Fitbit Refreshing Tokens Documentation}
   * for more information
   */
  async _refreshAccessToken(): Promise<void> {
    console.log('Refreshing access token');
    const accessTokenInfo: Object = await this.client.refreshAccessToken(
      this.accessTokenInfo.accessToken,
      this.accessTokenInfo.refreshToken,
      -1,
    );
    console.log(accessTokenInfo);
    this.setAccessTokenInfo(accessTokenInfo);
  }

  async _refreshAccessTokenIfNeeded(response: Object): Promise<boolean> {
    if (FitbitClient._isAccessTokenExpired(response)) {
      console.log('Access token is expired, need to refresh');
      await this._refreshAccessToken();
      return true;
    } else {
      return false;
    }
  }
}
