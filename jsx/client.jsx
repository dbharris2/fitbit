/* @flow */

import FitbitApiClient from 'fitbit-node';

require('babel-polyfill');

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
    this.client = new FitbitApiClient(clientId, clientSecret);
  }

  /**
   * See {@link https://dev.fitbit.com/docs/oauth2/#access-token-request Fitbit Access Token Request}
   * for more information
   */
  async getAccessToken(code: string, callbackUrl: string) {
    const accessTokenInfo = await this.client.getAccessToken(code, callbackUrl);
    this.setAccessTokenInfo(accessTokenInfo);
    return accessTokenInfo;
  }

  /**
   * See {@link https://dev.fitbit.com/docs/activity/#get-daily-activity-summary Fitbit Activity Documentation}
   * for more information
   */
  async getActivity(date: string) {
    const activity = await this.client.get(
      '/activities/date/' + date + '.json',
      this.accessToken,
      this.userId,
    );
    return activity[0];
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
    const activityTimeSeries = await this.client.get(
      '/' + resourcePath + '/date/' + baseDate + '/' + endDate + '.json',
      this.accessToken,
      this.userId,
    );
    return activityTimeSeries[0];
  }

  /**
   * See {@link https://dev.fitbit.com/docs/oauth2/ Fitbit Authorization Documentation}
   * for more information
   */
  getAuthorizeUrl(callbackUrl: string) {
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
    const profile = await this.client.get(
      '/profile.json',
      this.accessToken,
      this.userId,
    );
    return profile[0];
  }

  /**
   * See {@link https://dev.fitbit.com/docs/oauth2/#refreshing-tokens Fitbit Refreshing Tokens Documentation}
   * for more information
   */
  async refreshAccessToken() {
    const accessTokenInfo = await this.client.refreshAccessToken(
      this.accessToken,
      this.refreshToken,
      -1,
    );
    this.setAccessTokenInfo(accessTokenInfo);
    return accessTokenInfo;
  }

  setAccessTokenInfo(accessTokenInfo: AccessTokenInfo) {
    this.accessToken = accessTokenInfo.access_token;
    this.refreshToken = accessTokenInfo.refresh_token;
    this.userId = accessTokenInfo.user_id;
  }
}
