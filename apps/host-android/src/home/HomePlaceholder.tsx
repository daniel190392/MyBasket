import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PButton, colors, spacing, textPresets } from 'ui-components';

export type HomePlaceholderProps = {
  displayName: string;
  email: string;
  onSignOutPress: () => void;
};

// Stands in for the home module until it exists. It takes plain props so the
// real module will not need to depend on auth-flow.
export function HomePlaceholder({
  displayName,
  email,
  onSignOutPress,
}: HomePlaceholderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hello, {displayName}</Text>
      <Text style={styles.caption}>{email}</Text>
      <PButton title="Sign out" variant="secondary" onPress={onSignOutPress} />
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
