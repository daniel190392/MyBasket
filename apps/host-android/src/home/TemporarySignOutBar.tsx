import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PButton, colors, spacing } from 'ui-components';

type TemporarySignOutBarProps = {
  onSignOutPress: () => void;
};

// Stands in until the native profile screen exists: that screen will own
// signing out. Remove this bar together with its use in HomeRoot.
export function TemporarySignOutBar({
  onSignOutPress,
}: TemporarySignOutBarProps) {
  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.bar}>
        <PButton
          title="Sign out"
          variant="secondary"
          onPress={onSignOutPress}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
  },
  bar: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
});
