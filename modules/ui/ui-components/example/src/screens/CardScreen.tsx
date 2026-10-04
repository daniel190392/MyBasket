import React, { useState } from 'react';
import { View, ScrollView, Text, StyleSheet, Modal } from 'react-native';

import {
  PCard,
  PButton,
  colors,
  spacing,
  textPresets,
  borderRadius,
  shadows,
  withOpacity,
} from '../../../src';

import { showcaseStyles } from './showcaseStyles';

const OVERLAY_OPACITY = 0.5;

export const CardScreen = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  return (
    <>
      <ScrollView
        style={showcaseStyles.container}
        contentContainerStyle={showcaseStyles.content}
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
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Card pressed!</Text>
            <PButton title="Ok" onPress={() => setIsModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  cardTitle: {
    ...textPresets.caption,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: withOpacity(colors.shadow, OVERLAY_OPACITY),
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
    marginBottom: spacing.xs,
  },
});
