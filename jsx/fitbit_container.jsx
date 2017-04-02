import React from 'react'
import axios from 'axios'

type FitbitContainerProps = {}

export default class FitbitContainer extends React.Component {
  props: FitbitContainerProps

  state: {
    accessToken: string,
    activity: ?Object,
    activityTimeSeries: ?Object,
    clientId: string,
    clientSecret: string,
    user: ?Object,
  }

  constructor(props: FitbitContainerProps): void {
    super(props);
    this.state = {
      accessToken: '',
      activity: null,
      activityTimeSeries: null,
      clientId: '',
      clientSecret: '',
      user: null,
    }
  }

  componentDidMount(): void {
    axios.get('/activity').then((response) => {
      this.setState({
        activity: response.data,
      })
    })

    axios.get('/activity-time-series').then((response) => {
      this.setState({
        activityTimeSeries: response.data["activities-steps"],
      })
    })

    axios.get('/profile').then((response) => {
      this.setState({
        user: response.data.user,
      })
    })
  }

  render() {
    return (
      <div>
        <h1>2017 Fitbit Competition</h1>

        <h3>Profile Info</h3>
        <img src={this.state.user == null ? "" : this.state.user.avatar} />
        <p>Name: {this.state.user == null ? "" : this.state.user.displayName}</p>
        <p>Fitbit Member Since: {this.state.user == null ? "" : this.state.user.memberSince}</p>

        <h3>Activity Info</h3>
        <p>Steps on 2016-05-10: {this.state.activity == null ? "" : this.state.activity.summary.steps}</p>
        <p>Floors on 2016-05-10: {this.state.activity == null ? "" : this.state.activity.summary.floors}</p>

        <h3>Activity Time Series Info</h3>
        {
          this.state.activityTimeSeries == null ? "" : this.state.activityTimeSeries.map((activityTimeSeries) => {
            return (
              <div key={activityTimeSeries.dateTime}>
                <p>Steps on {activityTimeSeries.dateTime}: {activityTimeSeries.value}</p>
              </div>
            )
          })
        }
      </div>
    )
  }
}
