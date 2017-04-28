/* @flow */

import Avatar from 'material-ui/Avatar';
import Flexbox from 'flexbox-react';
import React from 'react';
import ReactEmoji from 'react-emoji';
import Subheader from 'material-ui/Subheader';
import {List, ListItem} from 'material-ui/List';

import Competitor from './competitor';
import type {FitbitCompetitor} from './fitbit_competitor';

function competitors(competitors: Array<FitbitCompetitor>) {
  return competitors.map((competitor: FitbitCompetitor) => {
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
        secondaryText={
          <h5>
            {'Total steps: ' + competitor.totalSteps}
            <br />
            {"Yesterday's steps: " + competitor.yesterdaysSteps}
          </h5>
        }
        secondaryTextLines={2}
      />
    );
  });
}

function subHeader(text: string, fontSize: string, color: string) {
  return (
    <Subheader
      inset={false}
      style={{
        fontFamily: 'Lucida Grande',
        fontSize: fontSize,
        fontWeight: 900,
        textAlign: 'center',
        color: color,
        marginTop: '-10px',
      }}
    >
      {ReactEmoji.emojify(text)}
    </Subheader>
  );
}

function emojiText(isWinning: boolean): string {
  return isWinning ? ':moneybag:' : ':poop:';
}

function stepColor(isWinning: boolean): string {
  return isWinning ? 'green' : 'red';
}

function titleText(stepCount: string, isWinning: boolean): string {
  return emojiText(isWinning) + ' ' + stepCount + ' ' + emojiText(isWinning);
}

export default function Team(
  props: {
    competitors: Array<FitbitCompetitor>,
    name: string,
    stepCount: string,
    isWinning: boolean,
  },
) {
  return (
    <Flexbox justifyContent="center" flexDirection="column">
      <List>
        {subHeader(props.name, '24px', 'black')}
        {subHeader(
          titleText(props.stepCount, props.isWinning),
          '18px',
          stepColor(props.isWinning),
        )}
        {competitors(props.competitors)}
      </List>
    </Flexbox>
  );
}
