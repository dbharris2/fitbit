/* @flow */

import Flexbox from 'flexbox-react';
import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';
import React from 'react';
import axios from 'axios';
import {LineChart} from 'react-chartkick';

import Competitor from './competitor';
import CompetitorStory from './competitor_story';
import CompetitorToggles from './competitor_toggles';
import type {FitbitCompetitor} from './fitbit_competitor';

type FitbitContainerProps = {};

function _renderActivityTimeSeries(
  competitors: Array<FitbitCompetitor>,
): Array<Object> {
  return competitors.map((competitor: FitbitCompetitor) => {
    return (
      <CompetitorStory
        data={competitor.activityTimeSeries}
        imageUri={competitor.profile.user.avatar}
        key={competitor.profile.user.displayName}
        size={80}
        style={{
          marginBottom: '10px',
          padding: '10px',
        }}
        title={competitor.profile.user.displayName}
      />
    );
  });
}

function renderActivityTimeSeries(
  competitors: ?Array<FitbitCompetitor>,
): ?Array<Object> {
  return competitors == null ? null : _renderActivityTimeSeries(competitors);
}

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
      <Flexbox alignItems="stretch" flexDirection="column">

        <Flexbox flexDirection="row" justifyContent="center">
          <h1>2017 Fitbit Competition</h1>
        </Flexbox>

        <Flexbox alignItems="center" flexDirection="column">
          {renderCompetitors(this.state.competitors)}
        </Flexbox>

        <RaisedButton
          href="/authenticate"
          label="Join the Fun!"
          primary={true}
          style={{margin: 12}}
        />

        <Paper style={{marginBottom: '10px', padding: '10px'}}>
          {this.state.selectedTotalActivityTimeSeriesCompetitors == null
            ? null
            : <LineChart
                data={formatCompetitorsActivityTimeSeriesData(
                  this.state.selectedTotalActivityTimeSeriesCompetitors,
                )}
                xtitle={'Date'}
                ytitle={'Steps'}
              />}
        </Paper>

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
              style={null}
            />}

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

        {renderActivityTimeSeries(this.state.competitors)}
      </Flexbox>
    );
  }
}
