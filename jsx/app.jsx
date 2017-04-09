/* @flow */

import assert from 'assert';

export default class FitbitApp {
  clientId: string;
  clientSecret: string;

  constructor(clientId: string, clientSecret: string) {
    assert(clientId != null);
    assert(clientSecret != null);
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  getClientId(): string {
    return this.clientId;
  }

  getClientSecret(): string {
    return this.clientSecret;
  }

  static fromJson(appData: Object): FitbitApp {
    return new FitbitApp(appData.client_id, appData.client_secret);
  }
}
