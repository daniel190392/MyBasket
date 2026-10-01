import React from 'react';
import { ScrollView } from 'react-native';

import { PLink } from '../../../src';

import { ShowcaseSection } from './ShowcaseSection';
import { showcaseStyles as styles } from './showcaseStyles';

const ignorePress = () => {};

export const LinkScreen = () => (
  <ScrollView style={styles.container} contentContainerStyle={styles.content}>
    <ShowcaseSection title="Primary link">
      <PLink link="Go to account" onPress={ignorePress} />
    </ShowcaseSection>
    <ShowcaseSection title="Secondary link">
      <PLink link="Go external" variant="secondary" onPress={ignorePress} />
    </ShowcaseSection>
    <ShowcaseSection title="Link with static text">
      <PLink text="Go to" link="account" onPress={ignorePress} />
    </ShowcaseSection>
    <ShowcaseSection title="Center link">
      <PLink text="Go to" link="account" align="center" onPress={ignorePress} />
    </ShowcaseSection>
    <ShowcaseSection title="Right link">
      <PLink text="Go to" link="account" align="right" onPress={ignorePress} />
    </ShowcaseSection>
  </ScrollView>
);
