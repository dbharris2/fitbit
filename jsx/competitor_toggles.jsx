/* @flow */

import Flexbox from 'flexbox-react';
import React from 'react';
import Toggle from 'material-ui/Toggle';

import type {FitbitCompetitor} from './fitbit_competitor';

type CompetitorTogglesProps = {
  competitors: Array<FitbitCompetitor>,
  onToggle: (userId: string, isChecked: boolean) => void,
  style: ?Object,
};

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
      justifyContent="space-around"
      style={props.style}
    >
      {props.competitors.map((competitor: Object) => {
        return (
          <Toggle
            defaultToggled={true}
            name={competitor.profile.user.encodedId}
            label={competitor.profile.user.displayName}
            onToggle={(event: Object, isInputChecked: boolean) => {
              props.onToggle(event.target.name, isInputChecked);
            }}
            style={{width: 200}}
          />
        );
      })}
    </Flexbox>
  );
}
