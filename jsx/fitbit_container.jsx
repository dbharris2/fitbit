/* @flow */

import React from 'react';
import axios from 'axios';

import {LineChart} from 'react-chartkick';

type FitbitContainerProps = {};

function formatActivityTimeSeriesData(
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
      <div>
        <h1>2017 Fitbit Competition</h1>
        {this.state.users == null
          ? ''
          : this.state.users.map((user: Object) => {
              return (
                <div key={user.displayName}>
                  <img src={user.avatar} width={50} />
                  <p>Name: {user.displayName}</p>
                  <p>Fitbit Member Since: {user.memberSince}</p>
                </div>
              );
            })}
        {this.state.activityTimeSeries == null
          ? ''
          : <div>
              <LineChart
                data={formatActivityTimeSeriesData(
                  this.state.activityTimeSeries,
                )}
                xtitle={'Date'}
                ytitle={'Steps'}
              />
            </div>}
        {this.state.activityTimeSeries == null
          ? ''
          : this.state.activityTimeSeries.map((activityTimeSeries: Object) => {
              return (
                <div>
                  <LineChart
                    data={activityTimeSeries['activities-steps'].map(steps => {
                      return [steps.dateTime, steps.value];
                    })}
                    xtitle={'Date'}
                    ytitle={'Steps'}
                  />
                </div>
              );
            })}
      </div>
    );
  }
}
