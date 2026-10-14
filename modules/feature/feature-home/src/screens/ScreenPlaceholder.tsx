import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, textPresets } from 'ui-components';

import { homeStrings } from './strings';

type ScreenPlaceholderProps = {
  title: string;
};

// Stand-in until each screen is built from its design.
export function ScreenPlaceholder({ title }: ScreenPlaceholderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.caption}>{homeStrings.placeholderCaption}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background,
  },
  title: {
    ...textPresets.title,
  },
  caption: {
    ...textPresets.caption,
  },
});
