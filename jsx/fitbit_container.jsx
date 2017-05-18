/* @flow */

import Flexbox from 'flexbox-react';
import React from 'react';
import axios from 'axios';
import {LineChart} from 'react-chartkick';

import Competitor from './competitor';
import CompetitorStory from './competitor_story';
import CompetitorToggles from './competitor_toggles';
import Header from './header';
import Team from './team';

import type {
  FitbitCompetition,
  FitbitCompetitor,
  FitbitTeam,
} from './fitbit_competitor';

function _renderCompetitors(
  competitors: Array<FitbitCompetitor>,
): Array<Object> {
  return competitors.map((competitor: FitbitCompetitor) => {
    return (
      <Competitor
        imageUri={competitor.profile.user.avatar}
        key={competitor.profile.user.displayName}
        size={100}
        style={{
          paddingLeft: '100px',
          paddingRight: '100px',
          marginBottom: '30px',
        }}
        subtitle={'Total steps: ' + competitor.totalSteps}
        title={competitor.profile.user.displayName}
      />
    );
  });
}

function renderCompetitors(
  competitors: ?Array<FitbitCompetitor>,
): ?Array<Object> {
  return competitors == null ? null : _renderCompetitors(competitors);
}

function _updateSelectedCompetitors(
  competitors: Array<FitbitCompetitor>,
  selectedCompetitors: Array<FitbitCompetitor>,
  userId: string,
  isChecked: boolean,
): Array<FitbitCompetitor> {
  if (isChecked) {
    competitors.forEach((competitor: FitbitCompetitor) => {
      if (competitor.profile.user.encodedId === userId) {
        selectedCompetitors.push(competitor);
      }
    });
    return selectedCompetitors;
  } else {
    const result = selectedCompetitors.filter(
      (competitor: FitbitCompetitor) => {
        return competitor.profile.user.encodedId !== userId;
      },
    );
    return result;
  }
}

function updateSelectedCompetitors(
  competitors: ?Array<FitbitCompetitor>,
  selectedCompetitors: ?Array<FitbitCompetitor>,
  userId: string,
  isChecked: boolean,
): ?Array<FitbitCompetitor> {
  if (competitors == null || selectedCompetitors == null) {
    return null;
  } else {
    return _updateSelectedCompetitors(
      competitors,
      selectedCompetitors,
      userId,
      isChecked,
    );
  }
}

type FitbitContainerProps = {};

export default class FitbitContainer extends React.Component {
  props: FitbitContainerProps;

  state: {
    competitors: ?Array<FitbitCompetitor>,
    selectedDailyActivityTimeSeriesCompetitors: ?Array<FitbitCompetitor>,
    selectedTotalActivityTimeSeriesCompetitors: ?Array<FitbitCompetitor>,
    teams: ?Array<FitbitTeam>,
    differenceActivityTimeSeries: ?Object,
  };

  constructor(props: FitbitContainerProps): void {
    super(props);
    this.state = {
      competitors: null,
      selectedDailyActivityTimeSeriesCompetitors: null,
      selectedTotalActivityTimeSeriesCompetitors: null,
      teams: null,
      differenceActivityTimeSeries: null,
    };
  }

  componentDidMount(): void {
    axios.get('/cached-competition').then(response => {
      if (response != null && response.data !== '') {
        const competition: FitbitCompetition = response.data;
        this.setState({
          competitors: competition.competitors,
          selectedDailyActivityTimeSeriesCompetitors: competition.competitors,
          selectedTotalActivityTimeSeriesCompetitors: competition.competitors,
          teams: competition.teams,
          differenceActivityTimeSeries: competition.differenceActivityTimeSeries,
        });
      }
    });

    axios.get('/competition').then(response => {
      if (response != null && response.data !== '') {
        const competition: FitbitCompetition = response.data;
        this.setState({
          competitors: competition.competitors,
          selectedDailyActivityTimeSeriesCompetitors: competition.competitors,
          selectedTotalActivityTimeSeriesCompetitors: competition.competitors,
          teams: competition.teams,
          differenceActivityTimeSeries: competition.differenceActivityTimeSeries,
        });
      }
    });
  }

  render() {
    return (
      <Flexbox
        alignItems="stretch"
        flexDirection="column"
        style={{
          overflow: 'hidden',
          fontFamily: 'Lucida Grande',
        }}
      >
        <Header
          style={{
            backgroundColor: '#EEEEEE',
            height: '200px',
            paddingLeft: '100px',
            paddingRight: '100px',
            marginBottom: '40px',
          }}
        />

        <Flexbox
          flexDirection="row"
          flexWrap="wrap"
          justifyContent="space-around"
          style={{
            marginBottom: '30px',
          }}
        >
          {this.state.teams == null
            ? null
            : this.state.teams.map((team: FitbitTeam) => {
                return (
                  <Flexbox flexDirection="column">
                    <Team
                      competitors={team.competitors}
                      name={team.name}
                      stepCount={team.totalSteps}
                      isWinning={team.isWinning}
                    />
                  </Flexbox>
                );
              })}
        </Flexbox>

        <Flexbox alignItems="center" flexDirection="column">
          <h2>Team - Total Steps/Day</h2>
          {this.state.teams == null
            ? null
            : <LineChart
                data={this.state.teams.map((team: FitbitTeam) => {
                  return team.activityTimeSeries;
                })}
                xtitle={'Date'}
                ytitle={'Steps'}
              />}
        </Flexbox>

        <Flexbox alignItems="center" flexDirection="column">
          <h2>Total Steps/Day</h2>
          {this.state.selectedTotalActivityTimeSeriesCompetitors == null
            ? null
            : <LineChart
                data={this.state.selectedTotalActivityTimeSeriesCompetitors.map(
                  (competitor: FitbitCompetitor) => {
                    return competitor.totalActivityTimeSeries;
                  },
                )}
                xtitle={'Date'}
                ytitle={'Steps'}
              />}
        </Flexbox>

        {this.state.competitors == null
          ? null
          : <CompetitorToggles
              competitors={this.state.competitors}
              onToggle={(userId: string, isChecked: boolean) => {
                this.setState({
                  selectedTotalActivityTimeSeriesCompetitors: updateSelectedCompetitors(
                    this.state.competitors,
                    this.state.selectedTotalActivityTimeSeriesCompetitors,
                    userId,
                    isChecked,
                  ),
                });
              }}
              style={{
                marginBottom: '30px',
              }}
            />}

        <Flexbox alignItems="center" flexDirection="column">
          <h2>Daily Steps/Day</h2>
          {this.state.selectedDailyActivityTimeSeriesCompetitors == null
            ? null
            : <LineChart
                data={this.state.selectedDailyActivityTimeSeriesCompetitors.map(
                  (competitor: FitbitCompetitor) => {
                    return {
                      name: competitor.profile.user.displayName,
                      data: competitor.activityTimeSeries,
                    };
                  },
                )}
                xtitle={'Date'}
                ytitle={'Steps'}
              />}
        </Flexbox>

        {this.state.competitors == null
          ? null
          : <CompetitorToggles
              competitors={this.state.competitors}
              onToggle={(userId: string, isChecked: boolean) => {
                this.setState({
                  selectedDailyActivityTimeSeriesCompetitors: updateSelectedCompetitors(
                    this.state.competitors,
                    this.state.selectedDailyActivityTimeSeriesCompetitors,
                    userId,
                    isChecked,
                  ),
                });
              }}
              style={null}
            />}

        {this.state.differenceActivityTimeSeries == null
          ? null
          : <Flexbox alignItems="center" flexDirection="column">
              <h2>Difference in Team Steps/Day</h2>
              <LineChart
                data={this.state.differenceActivityTimeSeries}
                xtitle={'Date'}
                ytitle={'Difference in Steps'}
              />
            </Flexbox>}
      </Flexbox>
    );
  }
}
