/* @flow */

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import React from 'react';
import ReactDOM from 'react-dom';

import FitbitContainer from './fitbit_container';

const App = () => (
  <MuiThemeProvider>
    <FitbitContainer />
  </MuiThemeProvider>
);

ReactDOM.render(<App />, document.getElementById('content'));
