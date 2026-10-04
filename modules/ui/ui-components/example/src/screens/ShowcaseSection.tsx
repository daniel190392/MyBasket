import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { PCard, spacing, textPresets } from '../../../src';

interface ShowcaseSectionProps {
  title: string;
  children: React.ReactNode;
}

export const ShowcaseSection = ({ title, children }: ShowcaseSectionProps) => (
  <PCard>
    <View style={styles.body}>
      <Text style={styles.title}>{title}</Text>
      {children}
    </View>
  </PCard>
);

const styles = StyleSheet.create({
  body: {
    width: '100%',
    alignItems: 'stretch',
  },
  title: {
    ...textPresets.caption,
    marginBottom: spacing.sm,
  },
});
