const FitbitApiClient = require('fitbit-node')

/**
 * Fetches data from Fitbit
 *
 * TODO: Use promises rather than callbacks
 */
export default class FitbitClient {

  constructor(clientId, clientSecret) {
    this.client = new FitbitApiClient(clientId, clientSecret)
  }

  /**
   * See {@link https://dev.fitbit.com/docs/oauth2/#access-token-request Fitbit Access Token Request}
   * for more information
   */
  getAccessToken(code, callbackUrl, onResult, onError) {
    this.client.getAccessToken(code, callbackUrl)
      .then((result) => {
        console.log(result)
        this._setAccessTokenInfo(result)
        onResult(result)
      })
      .catch((error) => { onError(error) })
  }

  /**
   * See {@link https://dev.fitbit.com/docs/activity/#get-daily-activity-summary Fitbit Activity Documentation}
   * for more information
   */
  getActivity(date, onResult) {
    this.client
      .get('/activities/date/' + date + '.json', this.accessToken, this.userId)
      .then((result) => { onResult(result[0]) })
  }

  /**
   * See {@link https://dev.fitbit.com/docs/activity/#activity-time-series Fitbit Activity Time Series Documentation}
   * for more information
   */
  getActivityTimeSeries(resourcePath, baseDate, endDate, onResult) {
    this.client.get(
      '/' + resourcePath + '/date/' + baseDate + '/' + endDate + '.json',
      this.accessToken,
      this.userId,
    ).then((result) => { onResult(result[0]) })
  }

  /**
   * See {@link https://dev.fitbit.com/docs/oauth2/ Fitbit Authorization Documentation}
   * for more information
   */
  getAuthorizeUrl(callbackUrl) {
    return this.client.getAuthorizeUrl(
      'activity heartrate location profile settings sleep social',
      callbackUrl,
    )
  }

  /**
   * See {@link https://dev.fitbit.com/docs/user/#get-profile Fitbit Profile Documentation}
   * for more information
   */
  getProfile(onResult) {
    this.client.get('/profile.json', this.accessToken, this.userId)
      .then((result) => { onResult(result[0]) })
  }

  /**
   * See {@link https://dev.fitbit.com/docs/oauth2/#refreshing-tokens Fitbit Refreshing Tokens Documentation}
   * for more information
   */
  refreshAccessToken() {
    this.client.refreshAccessToken(accessToken, refreshToken, -1)
      .then((result) => { this._setAccessTokenInfo(result) })
  }

  _setAccessTokenInfo(result) {
    this.accessToken = result.access_token
    this.refreshToken = result.refresh_token
    this.userId = result.user_id
  }
}
