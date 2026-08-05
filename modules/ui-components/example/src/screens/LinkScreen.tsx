import React from 'react';
import { View, ScrollView, StyleSheet, Text } from 'react-native';

import { PLink, PCard } from '../../../src';
import { colors, spacing, textPresets } from '../../../src';

export const LinkScreen = () => {
  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <PCard>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Primary link</Text>
            <PLink link="Go to account" onPress={() => {}} />
          </View>
        </PCard>
        <PCard>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Secondary link</Text>
            <PLink link="Go external" variant="secondary" onPress={() => {}} />
          </View>
        </PCard>
        <PCard>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Link with static text</Text>
            <PLink text="Go to" link="account" onPress={() => {}} />
          </View>
        </PCard>
        <PCard>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Center Link</Text>
            <PLink
              text="Go to"
              link="account"
              onPress={() => {}}
              align="center"
            />
          </View>
        </PCard>
        <PCard>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Right Link</Text>
            <PLink
              text="Go to"
              link="account"
              onPress={() => {}}
              align="right"
            />
          </View>
        </PCard>
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
  cardContent: {
    width: '100%',
  },
  cardTitle: {
    ...textPresets.title,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
});
