import React from 'react';
import { ScrollView, Text } from 'react-native';

import { MPressableScale } from '../../../src';

import { ShowcaseSection } from './ShowcaseSection';
import { showcaseStyles as styles } from './showcaseStyles';

export const PressableScaleScreen = () => (
  <ScrollView style={styles.container} contentContainerStyle={styles.content}>
    <ShowcaseSection title="Default">
      <MPressableScale style={styles.box}>
        <Text style={styles.boxText}>Press me</Text>
      </MPressableScale>
    </ShowcaseSection>

    <ShowcaseSection title="Disabled">
      <MPressableScale disabled style={styles.box}>
        <Text style={styles.boxText}>Disabled</Text>
      </MPressableScale>
    </ShowcaseSection>
  </ScrollView>
);
