/* @flow */

export type User = {
  avatar: string,
  displayName: string,
  encodedId: string,
};

export type Profile = {
  user: User,
};

export type FitbitCompetitor = {
  activityTimeSeries: Object,
  profile: Profile,
  totalActivityTimeSeries: Object,
  totalSteps: string,
};
