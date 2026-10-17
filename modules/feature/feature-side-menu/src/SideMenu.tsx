import React from 'react';
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  PButton,
  borderRadius,
  colors,
  shadows,
  spacing,
  textPresets,
  typography,
  withOpacity,
} from 'ui-components';

import { userInitial } from './domain/userInitial';
import { sideMenuStrings } from './strings';
import { useSideMenuAnimation } from './useSideMenuAnimation';

export type SideMenuProps = {
  isOpen: boolean;
  userName: string;
  onClose: () => void;
  onSignOutPress: () => void;
};

const PANEL_WIDTH_RATIO = 0.8;
const MAX_PANEL_WIDTH = 360;
const AVATAR_SIZE = 56;
const SCRIM_OPACITY = 0.42;

// A modal keeps the menu above the host's native chrome and gives Android's
// back button a meaning (`onRequestClose`) without any navigation library.
export function SideMenu({
  isOpen,
  userName,
  onClose,
  onSignOutPress,
}: SideMenuProps) {
  const { width: windowWidth } = useWindowDimensions();
  const { isRendered, progress } = useSideMenuAnimation(isOpen);

  if (!isRendered) return null;

  const panelWidth = Math.min(windowWidth * PANEL_WIDTH_RATIO, MAX_PANEL_WIDTH);
  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-panelWidth, 0],
  });

  return (
    <Modal
      transparent
      visible
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <Animated.View style={[styles.scrim, { opacity: progress }]}>
          <Pressable
            style={styles.scrimTouchArea}
            accessibilityRole="button"
            accessibilityLabel={sideMenuStrings.closeMenuLabel}
            onPress={onClose}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.panel,
            { width: panelWidth, transform: [{ translateX }] },
          ]}
        >
          <SafeAreaView style={styles.panelContent} edges={['top', 'bottom']}>
            <View style={styles.profile}>
              <View style={styles.avatar}>
                <Text style={styles.avatarInitial}>
                  {userInitial(userName)}
                </Text>
              </View>
              <Text style={styles.userName} numberOfLines={2}>
                {userName}
              </Text>
            </View>

            <View style={styles.spacer} />

            <PButton
              title={sideMenuStrings.signOut}
              icon="logout"
              variant="secondary"
              onPress={onSignOutPress}
            />
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: withOpacity(colors.shadow, SCRIM_OPACITY),
  },
  scrimTouchArea: {
    flex: 1,
  },
  panel: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    backgroundColor: colors.background,
    borderTopRightRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
    ...shadows.md,
  },
  panelContent: {
    flex: 1,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xxl,
  },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: colors.softHighlight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  userName: {
    ...textPresets.title,
    flex: 1,
  },
  spacer: {
    flex: 1,
  },
});
