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
  yesterdaysSteps: string,
};

export type FitbitTeam = {
  activityTimeSeries: Object,
  competitors: Array<FitbitCompetitor>,
  isWinning: boolean,
  name: string,
  totalSteps: string,
};

export type FitbitCompetition = {
  competitors: Array<FitbitCompetitor>,
  teams: Array<FitbitTeam>,
};
