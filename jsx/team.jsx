/* @flow */

import Avatar from 'material-ui/Avatar';
import Flexbox from 'flexbox-react';
import React from 'react';
import Subheader from 'material-ui/Subheader';
import {List, ListItem} from 'material-ui/List';

import Competitor from './competitor';
import type {FitbitCompetitor} from './fitbit_competitor';

export default function Team(
  props: {
    competitors: Array<FitbitCompetitor>,
    name: string,
  },
) {
  return (
    <Flexbox justifyContent="center" flexDirection="column">
      <List>
        <Subheader inset={false} style={{fontSize: '20px'}}>
          {props.name}
        </Subheader>
        {props.competitors.map((competitor: FitbitCompetitor) => {
          return (
            <ListItem
              disabled={true}
              key={competitor.profile.user.encodedId}
              leftAvatar={
                <Avatar
                  size={60}
                  src={competitor.profile.user.avatar}
                  style={{marginLeft: '-20px', marginTop: '20px'}}
                />
              }
              primaryText={<h3>{competitor.profile.user.displayName}</h3>}
              secondaryText={<h5>{'Total steps: ' + competitor.totalSteps}</h5>}
            />
          );
        })}
      </List>
    </Flexbox>
  );
}
