/* @flow */

import Flexbox from 'flexbox-react';
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
      <h1 style={{color: '#333333', fontFamily: 'Lucida Grande'}}>
        Fitbit Pie Challenge
      </h1>
    </Flexbox>
  );
}
