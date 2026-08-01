import React, { useLayoutEffect, useState } from 'react';
import { View, ScrollView, Text, StyleSheet, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { PCard, PButton } from '../../../src';
import {
  colors,
  spacing,
  textPresets,
  borderRadius,
  shadows,
  withOpacity,
} from '../../../src';

export const CardScreen = () => {
  const navigation = useNavigation();
  const [isModalVisible, setIsModalVisible] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'PCard',
    });
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <PCard onPress={() => setIsModalVisible(true)}>
          <Text style={styles.cardTitle}>Enabled Card</Text>
        </PCard>
        <PCard isClickable={false}>
          <Text style={styles.cardTitle}>Disabled Card</Text>
        </PCard>
      </ScrollView>

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>¡Card Pressed!</Text>
            <PButton title="Ok" onPress={() => setIsModalVisible(false)} />
          </View>
        </View>
      </Modal>
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
  cardTitle: {
    ...textPresets.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: withOpacity(colors.shadow, 0.5),
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  modalContainer: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.xl,
    ...shadows.sm,
  },
  modalTitle: {
    ...textPresets.subtitle,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
});
