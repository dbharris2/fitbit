/* @flow */

import React from 'react';
import axios from 'axios';

import {LineChart} from 'react-chartkick';

type FitbitContainerProps = {};

export default class FitbitContainer extends React.Component {
  props: FitbitContainerProps;

  state: {
    activityTimeSeries: ?Object,
    user: ?Object,
  };

  constructor(props: FitbitContainerProps): void {
    super(props);
    this.state = {
      activityTimeSeries: null,
      user: null,
    };
  }

  componentDidMount(): void {
    axios.get('/activity-time-series').then(response => {
      this.setState({
        activityTimeSeries: response.data['activities-steps'],
      });
    });

    axios.get('/profile').then(response => {
      this.setState({
        user: response.data.user,
      });
    });
  }

  render() {
    return (
      <div>
        <h1>2017 Fitbit Competition</h1>

        <h3>Profile Info</h3>
        <img src={this.state.user == null ? '' : this.state.user.avatar} />
        <p>
          Name: {this.state.user == null ? '' : this.state.user.displayName}
        </p>
        <p>
          Fitbit Member Since:
          {' '}
          {this.state.user == null ? '' : this.state.user.memberSince}
        </p>

        <h3>Steps Per Day</h3>
        {this.state.activityTimeSeries == null
          ? ''
          : <LineChart
              data={this.state.activityTimeSeries.map(activityTimeSeries => {
                return [activityTimeSeries.dateTime, activityTimeSeries.value];
              })}
              xtitle={'Date'}
              ytitle={'Steps'}
            />}
      </div>
    );
  }
}
