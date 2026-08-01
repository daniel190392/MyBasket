import React, { useLayoutEffect } from 'react';
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { PButton, PCard } from '../../../src';
import { colors, spacing, textPresets } from '../../../src';

export const ButtonScreen = () => {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'PButton',
    });
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <PCard>
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>Primary Button</Text>
            <PButton title="Ok" onPress={() => console.log('Primary')} />
          </View>
        </PCard>
        <PCard>
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>Secondary Button</Text>
            <PButton
              title="Cancel"
              variant="secondary"
              onPress={() => console.log('Secondary')}
            />
          </View>
        </PCard>
        <PCard>
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>Loading Button</Text>
            <PButton
              title="Ok"
              onPress={() => console.log('Secondary')}
              isLoading={true}
            />
          </View>
        </PCard>
        <PCard>
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>Disabled Button</Text>
            <PButton
              title="Ok"
              onPress={() => console.log('Secondary')}
              isDisabled={true}
            />
          </View>
        </PCard>
      </ScrollView>
    </SafeAreaView>
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
  cardBody: {
    width: '100%',
    alignItems: 'stretch',
  },
  cardTitle: {
    ...textPresets.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
});
