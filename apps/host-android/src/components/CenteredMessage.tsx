import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, textPresets } from 'ui-components';

type CenteredMessageProps = {
  title: string;
  caption: string;
};

export function CenteredMessage({ title, caption }: CenteredMessageProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.caption}>{caption}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
    gap: spacing.lg,
    backgroundColor: colors.background,
  },
  title: {
    ...textPresets.title,
  },
  caption: {
    ...textPresets.caption,
    textAlign: 'center',
  },
});
