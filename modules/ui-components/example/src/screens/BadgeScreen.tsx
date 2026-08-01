import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';

import { PBadge } from '../../../src';
import { colors, spacing } from '../../../src';

export const BadgeScreen = () => {
  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <PBadge title="Important" />
        <PBadge title="Warning" variant="warning" />
        <PBadge title="Informative" variant="informative" />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
});
