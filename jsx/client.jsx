/* @flow */

import assert from 'assert';

import AccessTokenInfo from './access_token_info';
import FitbitApiClient from 'fitbit-node';
import FitbitClientManager from './client_manager';

/**
 * Fetches data from Fitbit
 */
export default class FitbitClient {
  accessTokenInfo: AccessTokenInfo;
  client: FitbitApiClient;
  clientManager: FitbitClientManager;

  constructor(
    clientId: String,
    clientSecret: String,
    fitbitClientManager: FitbitClientManager,
  ) {
    this.client = new FitbitApiClient(clientId, clientSecret);
    this.clientManager = fitbitClientManager;
  }

  getAccessTokenInfo(): AccessTokenInfo {
    return this.accessTokenInfo;
  }

  getUserId(): string {
    return this.accessTokenInfo.userId;
  }

  /**
   * See {@link https://dev.fitbit.com/docs/oauth2/#access-token-request Fitbit Access Token Request}
   * for more information
   */
  async setAccessToken(code: string, callbackUrl: String): Promise<void> {
    assert(code != null);
    assert(callbackUrl != null);
    const accessTokenInfo: Object = await this.client.getAccessToken(
      code,
      callbackUrl,
    );
    this._setAccessTokenInfo(accessTokenInfo);
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

  async getCompetitor(
    resourcePath: string,
    baseDate: string,
    endDate: string,
  ): Promise<Object> {
    const activityTimeSeriesPromise: Promise<Object> = this.getActivityTimeSeries(
      resourcePath,
      baseDate,
      endDate,
    );
    const profilePromise: Promise<Object> = this.getProfile();
    const [activityTimeSeries, profile]: Array<Object> = await Promise.all([
      activityTimeSeriesPromise,
      profilePromise,
    ]);

    const formattedActivityTimeSeries: Array<Array<String>> = activityTimeSeries[
      'activities-steps'
    ].map((steps: Object) => {
      return [steps.dateTime, steps.value];
    });

    const totalActivityTimeSeriesUserData: Object = {};
    var totalSteps = 0;
    activityTimeSeries['activities-steps'].forEach((steps: Object) => {
      totalSteps += parseInt(steps.value);
      totalActivityTimeSeriesUserData[steps.dateTime] = totalSteps;
    });
    return {
      activityTimeSeries: formattedActivityTimeSeries,
      profile: profile,
      totalActivityTimeSeries: {
        name: profile.user.displayName,
        data: totalActivityTimeSeriesUserData,
      },
      totalSteps: totalSteps.toString(),
      yesterdaysSteps: formattedActivityTimeSeries[
        formattedActivityTimeSeries.length - 1
      ][1],
    };
  }

  /**
   * See {@link https://dev.fitbit.com/docs/oauth2/ Fitbit Authorization Documentation}
   * for more information
   */
  getAuthorizeUrl(callbackUrl: String): String {
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

  replaceAccessTokenInfo(accessTokenInfo: AccessTokenInfo): void {
    this.accessTokenInfo = accessTokenInfo;
    this.clientManager.updateClient(this);
  }

  _setAccessTokenInfo(accessTokenInfo: Object): void {
    assert(accessTokenInfo != null);
    this.accessTokenInfo = AccessTokenInfo.fromJson(accessTokenInfo);
    this.clientManager.updateClient(this);
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
    return response.errors[0].errorType === 'expired_token';
  }

  /**
   * See {@link https://dev.fitbit.com/docs/oauth2/#refreshing-tokens Fitbit Refreshing Tokens Documentation}
   * for more information
   */
  async _refreshAccessToken(): Promise<void> {
    const accessTokenInfo: Object = await this.client.refreshAccessToken(
      this.accessTokenInfo.accessToken,
      this.accessTokenInfo.refreshToken,
      -1,
    );
    this._setAccessTokenInfo(accessTokenInfo);
  }

  async _refreshAccessTokenIfNeeded(response: Object): Promise<boolean> {
    if (FitbitClient._isAccessTokenExpired(response)) {
      await this._refreshAccessToken();
      return true;
    } else {
      return false;
    }
  }
}
