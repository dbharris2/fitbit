import React from 'react'
import axios from 'axios'

type FitbitContainerProps = {}

export default class FitbitContainer extends React.Component {
  props: FitbitContainerProps

  state: {
    accessToken: string,
    clientId: string,
    clientSecret: string,
    user: string,
  }

  constructor(props: FitbitContainerProps): void {
    super(props);
    this.state = {
      accessToken: '',
      clientId: '',
      clientSecret: '',
      userId: '',
    }
  }

  componentDidMount(): void {
    axios.get('/app').then((appResponse) => {
      const app = appResponse.data;
      this.setState({
        clientId: app.client_id,
        clientSecret: app.client_secret,
      })

      const client = new Fitbit(clientId, clientSecret);

    })

    axios.get('/access-token').then((accessTokenResponse) => {
      const accessTokenObj = accessTokenResponse.data
      this.setState({
        accessToken: accessTokenObj.access_token,
        userId: accessTokenObj.user_id,
      })
    })
  }

  render() {
    return (
      <div>
        <h1>2017 Fitbit Competition</h1>
        <p>Access Token: {this.state.accessToken}</p>
        <p>Client ID: {this.state.clientId}</p>
        <p>Client Secret: {this.state.clientSecret}</p>
        <p>User ID: {this.state.userId}</p>
      </div>
    )
  }
}
