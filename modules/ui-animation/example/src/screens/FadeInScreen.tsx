import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { MFadeIn, MPressableScale, motion } from '../../../src';

import { ShowcaseSection } from './ShowcaseSection';
import { showcaseStyles as styles } from './showcaseStyles';

const CASCADE_ITEMS = [0, 1, 2];

export const FadeInScreen = () => {
  const [replayKey, setReplayKey] = useState(0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <MPressableScale
        style={styles.box}
        onPress={() => setReplayKey((key) => key + 1)}
      >
        <Text style={styles.boxText}>Replay</Text>
      </MPressableScale>

      <View key={replayKey} style={styles.group}>
        <ShowcaseSection title="Default">
          <MFadeIn style={styles.box}>
            <Text style={styles.boxText}>Fade in</Text>
          </MFadeIn>
        </ShowcaseSection>

        <ShowcaseSection title="Slow duration">
          <MFadeIn duration={motion.duration.slow} style={styles.box}>
            <Text style={styles.boxText}>Slow</Text>
          </MFadeIn>
        </ShowcaseSection>

        <ShowcaseSection title="Staggered delay">
          {CASCADE_ITEMS.map((index) => (
            <MFadeIn
              key={index}
              delay={index * motion.duration.fast}
              style={styles.box}
            >
              <Text style={styles.boxText}>Item {index + 1}</Text>
            </MFadeIn>
          ))}
        </ShowcaseSection>
      </View>
    </ScrollView>
  );
};
