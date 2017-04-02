import React from 'react'
import axios from 'axios'

type FitbitContainerProps = {}

export default class FitbitContainer extends React.Component {
  props: FitbitContainerProps

  state: {
    accessToken: string,
    activity: ?Object,
    clientId: string,
    clientSecret: string,
    user: ?Object,
  }

  constructor(props: FitbitContainerProps): void {
    super(props);
    this.state = {
      accessToken: '',
      activity: null,
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
        <img src={this.state.user == null ? "" : this.state.user.avatar} />
        <p>Name: {this.state.user == null ? "" : this.state.user.displayName}</p>
        <p>Fitbit Member Since: {this.state.user == null ? "" : this.state.user.memberSince}</p>
        <p>Steps on 2016-05-10: {this.state.activity == null ? "" : this.state.activity.summary.steps}</p>
        <p>Floors on 2016-05-10: {this.state.activity == null ? "" : this.state.activity.summary.floors}</p>
      </div>
    )
  }
}
