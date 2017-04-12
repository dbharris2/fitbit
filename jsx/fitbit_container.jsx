/* @flow */

import Flexbox from 'flexbox-react';
import RaisedButton from 'material-ui/RaisedButton';
import React from 'react';
import axios from 'axios';
import {LineChart} from 'react-chartkick';

import Competitor from './competitor';

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
      <Flexbox flexDirection="column">
        <Flexbox flexDirection="row" justifyContent="center">
          <h1>2017 Fitbit Competition</h1>
        </Flexbox>

        <Flexbox flexDirection="row" justifyContent="space-around">
          {this.state.users == null
            ? null
            : this.state.users.map((user: Object) => {
                return (
                  <div key={user.displayName}>
                    <Competitor
                      imageUri={user.avatar}
                      size={80}
                      subtitle={user.memberSince}
                      title={user.displayName}
                    />
                  </div>
                );
              })}
        </Flexbox>

        <Flexbox alignItems="center" flexDirection="column" paddingTop="40px">
          <RaisedButton
            href="/authenticate"
            label="Join the Fun!"
            primary={true}
            style={{margin: 12}}
          />

          {this.state.activityTimeSeries == null
            ? null
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
            ? null
            : this.state.activityTimeSeries.map(
                (activityTimeSeries: Object) => {
                  return (
                    <div>
                      <LineChart
                        data={activityTimeSeries[
                          'activities-steps'
                        ].map(steps => {
                          return [steps.dateTime, steps.value];
                        })}
                        xtitle={'Date'}
                        ytitle={'Steps'}
                      />
                    </div>
                  );
                },
              )}
        </Flexbox>
      </Flexbox>
    );
  }
}
