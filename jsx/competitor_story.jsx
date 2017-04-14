/* @flow */

import Avatar from 'material-ui/Avatar';
import Paper from 'material-ui/Paper';
import React from 'react';
import {LineChart} from 'react-chartkick';

import Competitor from './competitor';

export default function CompetitorStory(
  props: {
    data: Object,
    imageUri: string,
    size: number,
    style: Object,
    title: string,
  },
) {
  return (
    <Paper style={props.style}>
      <Competitor
        imageUri={props.imageUri}
        size={80}
        style={null}
        subtitle={null}
        title={props.title}
      />
      <h3 style={{marginLeft: '45%', marginRight: '45%'}}>
        Steps/Day
      </h3>
      <LineChart data={props.data} xtitle={'Date'} ytitle={'Steps'} />
    </Paper>
  );
}
