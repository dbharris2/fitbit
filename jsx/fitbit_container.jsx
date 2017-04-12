/* @flow */

import Flexbox from 'flexbox-react';
import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';
import React from 'react';
import axios from 'axios';
import {LineChart} from 'react-chartkick';

import Competitor from './competitor';
import CompetitorStory from './competitor_story';

type FitbitContainerProps = {};

function renderActivityTimeSeries(
  activityTimeSeries: ?Array<Object>,
  user: Object,
) {
  return activityTimeSeries == null || user == null
    ? null
    : activityTimeSeries.map((ats: Object) => {
        return (
          <CompetitorStory
            data={ats['activities-steps'].map(steps => {
              return [steps.dateTime, steps.value];
            })}
            imageUri={user.avatar}
            size={80}
            style={{
              marginBottom: '10px',
              padding: '10px',
            }}
            title={user.displayName}
          />
        );
      });
}

function renderCompetitors(users: ?Array<Object>) {
  return users == null
    ? null
    : users.map((user: Object) => {
        return (
          <div key={user.displayName}>
            <Competitor
              imageUri={user.avatar}
              size={80}
              subtitle={null}
              title={user.displayName}
            />
          </div>
        );
      });
}

function formatAllCompetitorsActivityTimeSeriesData(
  activityTimeSeriesData: Array<Object>,
): Array<Object> {
  const totalData: Array<Object> = activityTimeSeriesData.map(
    (activityTimeSeries: Object) => {
      const activityTimeSeriesUserData: Object = {};
      activityTimeSeries['activities-steps'].forEach(steps => {
        activityTimeSeriesUserData[steps.dateTime] = steps.value;
      });
      return {
        name: 'Name of User',
        data: activityTimeSeriesUserData,
      };
    },
  );
  return totalData;
}

export default class FitbitContainer extends React.Component {
  props: FitbitContainerProps;

  state: {
    activityTimeSeries: ?Array<Object>,
    users: ?Array<Object>,
  };

  constructor(props: FitbitContainerProps): void {
    super(props);
    this.state = {
      activityTimeSeries: null,
      users: null,
    };
  }

  componentDidMount(): void {
    axios.get('/activity-time-series').then(response => {
      this.setState({
        activityTimeSeries: response.data,
      });
    });

    axios.get('/profile').then(response => {
      this.setState({
        users: response.data.map((userWrapper: Object) => {
          return userWrapper.user;
        }),
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
          {renderCompetitors(this.state.users)}
        </Flexbox>

        <Flexbox alignItems="stretch" flexDirection="column" paddingTop="40px">
          <RaisedButton
            href="/authenticate"
            label="Join the Fun!"
            primary={true}
            style={{margin: 12}}
          />

          <Paper style={{marginBottom: '10px', padding: '10px'}}>
            {this.state.activityTimeSeries == null
              ? null
              : <div>
                  <LineChart
                    data={formatAllCompetitorsActivityTimeSeriesData(
                      this.state.activityTimeSeries,
                    )}
                    xtitle={'Date'}
                    ytitle={'Steps'}
                  />
                </div>}
          </Paper>

          {this.state.users == null
            ? null
            : renderActivityTimeSeries(
                this.state.activityTimeSeries,
                this.state.users[0],
              )}
        </Flexbox>
      </Flexbox>
    );
  }
}
