/* @flow */

import Flexbox from 'flexbox-react';
import React from 'react';
import Toggle from 'material-ui/Toggle';

import type {FitbitCompetitor} from './fitbit_competitor';

export default function CompetitorToggles(
  props: {
    competitors: Array<FitbitCompetitor>,
    onToggle: (userId: string, isChecked: boolean) => void,
    style: ?Object,
  },
) {
  return (
    <Flexbox
      flexDirection="row"
      flexWrap="wrap"
      justifyContent="space-between"
      style={props.style}
    >
      {props.competitors.map((competitor: FitbitCompetitor) => {
        return (
          <Toggle
            defaultToggled={true}
            key={competitor.profile.user.encodedId}
            name={competitor.profile.user.encodedId}
            label={competitor.profile.user.displayName}
            onToggle={(event: Object, isInputChecked: boolean) => {
              props.onToggle(event.target.name, isInputChecked);
            }}
            style={{marginLeft: 20, marginRight: 20, width: 200}}
          />
        );
      })}
    </Flexbox>
  );
}
