/* @flow */

import Flexbox from 'flexbox-react';
import React from 'react';
import axios from 'axios';
import {LineChart} from 'react-chartkick';

import Competitor from './competitor';
import CompetitorStory from './competitor_story';
import CompetitorToggles from './competitor_toggles';
import type {FitbitCompetitor} from './fitbit_competitor';
import Header from './header';
import Team from './team';

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

function _formatCompetitorsActivityTimeSeriesData(
  competitors: Array<FitbitCompetitor>,
): Array<Object> {
  return competitors.map((competitor: FitbitCompetitor) => {
    return competitor.totalActivityTimeSeries;
  });
}

function formatCompetitorsActivityTimeSeriesData(
  competitors: ?Array<FitbitCompetitor>,
): ?Array<Object> {
  return competitors == null
    ? null
    : _formatCompetitorsActivityTimeSeriesData(competitors);
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

function getFirstHalfOfCompetitors(
  competitors: Array<FitbitCompetitor>,
): Array<FitbitCompetitor> {
  var firstHalf: Array<FitbitCompetitor> = [];
  for (var index = 0; index < competitors.length / 2; index++) {
    firstHalf.push(competitors[index]);
  }
  return firstHalf;
}

function getLastHalfOfCompetitors(
  competitors: Array<FitbitCompetitor>,
): Array<FitbitCompetitor> {
  var lastHalf: Array<FitbitCompetitor> = [];
  for (
    var index = competitors.length / 2;
    index < competitors.length;
    index++
  ) {
    lastHalf.push(competitors[index]);
  }
  return lastHalf;
}

type FitbitContainerProps = {};

export default class FitbitContainer extends React.Component {
  props: FitbitContainerProps;

  state: {
    competitors: ?Array<FitbitCompetitor>,
    selectedDailyActivityTimeSeriesCompetitors: ?Array<FitbitCompetitor>,
    selectedTotalActivityTimeSeriesCompetitors: ?Array<FitbitCompetitor>,
  };

  constructor(props: FitbitContainerProps): void {
    super(props);
    this.state = {
      competitors: null,
      selectedDailyActivityTimeSeriesCompetitors: null,
      selectedTotalActivityTimeSeriesCompetitors: null,
    };
  }

  componentDidMount(): void {
    axios.get('/competitors').then(response => {
      this.setState({
        competitors: response.data,
        selectedDailyActivityTimeSeriesCompetitors: response.data,
        selectedTotalActivityTimeSeriesCompetitors: response.data,
      });
    });
  }

  render() {
    return (
      <Flexbox
        alignItems="stretch"
        flexDirection="column"
        style={{
          overflow: 'hidden',
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
          <Flexbox flexDirection="column">
            {this.state.competitors == null
              ? null
              : <Team
                  competitors={getFirstHalfOfCompetitors(
                    this.state.competitors,
                  )}
                  name="Team 1"
                />}
          </Flexbox>
          <Flexbox flexDirection="column">
            {this.state.competitors == null
              ? null
              : <Team
                  competitors={getLastHalfOfCompetitors(this.state.competitors)}
                  name="Team 2"
                />}
          </Flexbox>
        </Flexbox>

        <Flexbox alignItems="center" flexDirection="column">
          <h2>Total Steps/Day</h2>
          {this.state.selectedTotalActivityTimeSeriesCompetitors == null
            ? null
            : <LineChart
                data={formatCompetitorsActivityTimeSeriesData(
                  this.state.selectedTotalActivityTimeSeriesCompetitors,
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
      </Flexbox>
    );
  }
}
