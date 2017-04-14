/* @flow */

import Flexbox from 'flexbox-react';
import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';
import React from 'react';
import axios from 'axios';
import {LineChart} from 'react-chartkick';

import Competitor from './competitor';
import CompetitorStory from './competitor_story';

type User = {
  avatar: string,
  displayName: string,
};

type Profile = {
  user: User,
};

type FitbitCompetitor = {
  activityTimeSeries: Object,
  profile: Profile,
};

type FitbitContainerProps = {};

function _renderActivityTimeSeries(
  competitors: Array<FitbitCompetitor>,
): Array<Object> {
  return competitors.map((competitor: Object) => {
    return (
      <CompetitorStory
        data={competitor.activityTimeSeries['activities-steps'].map(steps => {
          return [steps.dateTime, steps.value];
        })}
        imageUri={competitor.profile.user.avatar}
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
  return competitors.map((competitor: Object) => {
    return (
      <div key={competitor.profile.user.displayName}>
        <Competitor
          imageUri={competitor.profile.user.avatar}
          size={80}
          subtitle={null}
          title={competitor.profile.user.displayName}
        />
      </div>
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
  const totalData: Array<Object> = competitors.map((competitor: Object) => {
    const activityTimeSeriesUserData: Object = {};
    competitor.activityTimeSeries['activities-steps'].forEach(steps => {
      activityTimeSeriesUserData[steps.dateTime] = steps.value;
    });
    return {
      name: competitor.profile.user.displayName,
      data: activityTimeSeriesUserData,
    };
  });
  return totalData;
}

function formatCompetitorsActivityTimeSeriesData(
  competitors: ?Array<FitbitCompetitor>,
): ?Array<Object> {
  return competitors == null
    ? null
    : _formatCompetitorsActivityTimeSeriesData(competitors);
}

export default class FitbitContainer extends React.Component {
  props: FitbitContainerProps;

  state: {
    competitors: ?Array<Object>,
  };

  constructor(props: FitbitContainerProps): void {
    super(props);
    this.state = {
      competitors: null,
    };
  }

  componentDidMount(): void {
    axios.get('/competitors').then(response => {
      this.setState({
        competitors: response.data,
      });
    });
  }

  render() {
    return (
      <Flexbox flexDirection="column">
        <Flexbox flexDirection="row" justifyContent="center">
          <h1>2017 Fitbit Competition</h1>
        </Flexbox>

        <Flexbox flexDirection="row" justifyContent="space-around">
          {renderCompetitors(this.state.competitors)}
        </Flexbox>

        <Flexbox alignItems="stretch" flexDirection="column" paddingTop="40px">
          <RaisedButton
            href="/authenticate"
            label="Join the Fun!"
            primary={true}
            style={{margin: 12}}
          />

          <Paper style={{marginBottom: '10px', padding: '10px'}}>
            {this.state.competitors == null
              ? null
              : <div>
                  <LineChart
                    data={formatCompetitorsActivityTimeSeriesData(
                      this.state.competitors,
                    )}
                    xtitle={'Date'}
                    ytitle={'Steps'}
                  />
                </div>}
          </Paper>

          {renderActivityTimeSeries(this.state.competitors)}
        </Flexbox>
      </Flexbox>
    );
  }
}
