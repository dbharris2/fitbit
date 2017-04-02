import React from 'react'
import axios from 'axios'

type FitbitContainerProps = {}

export default class FitbitContainer extends React.Component {
  props: FitbitContainerProps

  state: {
    accessToken: string,
    clientId: string,
    clientSecret: string,
    user: ?Object,
  }

  constructor(props: FitbitContainerProps): void {
    super(props);
    this.state = {
      accessToken: '',
      clientId: '',
      clientSecret: '',
      user: null,
    }
  }

  componentDidMount(): void {
    axios.get('/app').then((appResponse) => {
      const app = appResponse.data;
      this.setState({
        clientId: app.client_id,
        clientSecret: app.client_secret,
      })
    })

    axios.get('/access-token').then((accessTokenResponse) => {
      this.setState({
        accessToken: accessTokenResponse.data.access_token,
      })
    })

    axios.get('/profile').then((profile) => {
      this.setState({
        user: profile.data.user,
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
      </div>
    )
  }
}
