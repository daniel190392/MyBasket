import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { PButton, colors, spacing, textPresets } from 'ui-components';

import { homeStrings } from '../screens/strings';

type LoadMoreFooterProps = {
  isLoading: boolean;
  hasFailed: boolean;
  onRetryPress: () => void;
};

// Sits at the end of a paginated list; renders nothing when there is nothing
// to say.
export function LoadMoreFooter({
  isLoading,
  hasFailed,
  onRetryPress,
}: LoadMoreFooterProps) {
  if (isLoading) {
    return (
      <View style={styles.footer}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }
  if (hasFailed) {
    return (
      <View style={styles.footer}>
        <Text style={styles.message}>{homeStrings.loadMoreError}</Text>
        <PButton
          title={homeStrings.retry}
          variant="secondary"
          onPress={onRetryPress}
        />
      </View>
    );
  }
  return null;
}

const styles = StyleSheet.create({
  footer: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
  },
  message: {
    ...textPresets.caption,
    textAlign: 'center',
  },
});
