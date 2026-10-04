import React, { useState } from 'react';
import { ScrollView, Text } from 'react-native';

import { MPressableScale, MPulse } from '../../../src';

import { ShowcaseSection } from './ShowcaseSection';
import { showcaseStyles as styles } from './showcaseStyles';

export const PulseScreen = () => {
  const [isActive, setIsActive] = useState(true);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ShowcaseSection title="Active">
        <MPulse active={isActive} style={styles.box}>
          <Text style={styles.boxText}>Pulse</Text>
        </MPulse>
      </ShowcaseSection>

      <ShowcaseSection title="Control">
        <MPressableScale
          style={styles.box}
          onPress={() => setIsActive((value) => !value)}
        >
          <Text style={styles.boxText}>{isActive ? 'Stop' : 'Start'}</Text>
        </MPressableScale>
      </ShowcaseSection>
    </ScrollView>
  );
};
