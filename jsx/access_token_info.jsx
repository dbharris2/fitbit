/* @flow */

import assert from 'assert';

export default class AccessTokenInfo {
  accessToken: string;
  refreshToken: string;
  userId: string;

  constructor(accessToken: string, refreshToken: string, userId: string) {
    assert(accessToken != null);
    assert(refreshToken != null);
    assert(userId != null);
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.userId = userId;
  }

  getAccessToken(): string {
    return this.accessToken;
  }

  getRefreshToken(): string {
    return this.refreshToken;
  }

  getUserId(): string {
    return this.userId;
  }

  static fromJson(accessTokenInfo: Object): AccessTokenInfo {
    return new AccessTokenInfo(
      accessTokenInfo.access_token,
      accessTokenInfo.refresh_token,
      accessTokenInfo.user_id,
    );
  }
}
