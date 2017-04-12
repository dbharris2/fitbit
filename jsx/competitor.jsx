/* @flow */

import Avatar from 'material-ui/Avatar';
import React from 'react';
import Flexbox from 'flexbox-react';
import {transparent} from 'material-ui/styles/colors';

export default function Competitor(
  props: {
    imageUri: string,
    size: number,
    subtitle: ?string,
    title: string,
  },
) {
  return (
    <Flexbox alignItems="center" flexDirection="row">
      <Avatar
        backgroundColor={transparent}
        size={props.size}
        src={props.imageUri}
      />
      <Flexbox
        flexDirection="column"
        justifyContent="center"
        paddingLeft="10px"
      >
        <h3>{props.title}</h3>
        {props.subtitle == null ? null : <h5>{props.subtitle}</h5>}
      </Flexbox>
    </Flexbox>
  );
}
