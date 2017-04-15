/* @flow */

import Flexbox from 'flexbox-react';
import RaisedButton from 'material-ui/RaisedButton';
import React from 'react';

export default function Header(
  props: {
    style: ?Object,
  },
) {
  return (
    <Flexbox
      alignItems="center"
      flexDirection="row"
      flexWrap="wrap"
      justifyContent="space-between"
      style={props.style}
    >
      <h1 style={{color: '#333333'}}>Fitbit Pie Challenge</h1>
      <RaisedButton href="/authenticate" label="Join the Fun!" primary={true} />
    </Flexbox>
  );
}
