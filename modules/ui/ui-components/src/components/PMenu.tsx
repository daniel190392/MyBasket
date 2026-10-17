import React, { useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

import {
  borderRadius,
  colors,
  iconSize,
  opacity,
  shadows,
  spacing,
  textPresets,
} from '../theme';
import { IconName } from './iconShapes';
import { PIcon } from './PIcon';

import type { ReactNode } from 'react';

export interface PMenuItem {
  label: string;
  icon?: IconName;
  onPress: () => void;
  isDisabled?: boolean;
}

export interface PMenuProps {
  items: PMenuItem[];
  /** Renders the control that opens the menu; call `open` from its press. */
  renderTrigger: (open: () => void) => ReactNode;
}

type Anchor = { x: number; y: number; width: number; height: number };

const MENU_MIN_WIDTH = 220;
const MENU_GAP = spacing.xs;

// A popup list that opens right under its trigger, aligned to the trigger's
// right edge. It sits in a modal, so it floats above the screen and a tap
// anywhere else (or Android back) closes it.
export function PMenu({ items, renderTrigger }: PMenuProps) {
  const triggerRef = useRef<View>(null);
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const { width: windowWidth } = useWindowDimensions();

  const open = () => {
    triggerRef.current?.measureInWindow((x, y, width, height) =>
      setAnchor({ x, y, width, height })
    );
  };
  const close = () => setAnchor(null);

  const handleItemPress = (item: PMenuItem) => {
    close();
    item.onPress();
  };

  return (
    <>
      <View ref={triggerRef} collapsable={false}>
        {renderTrigger(open)}
      </View>

      <Modal
        transparent
        visible={anchor !== null}
        animationType="fade"
        onRequestClose={close}
      >
        <Pressable style={styles.backdrop} onPress={close} />
        {anchor && (
          <View
            accessibilityRole="menu"
            style={[
              styles.menu,
              {
                top: anchor.y + anchor.height + MENU_GAP,
                right: windowWidth - (anchor.x + anchor.width),
              },
            ]}
          >
            {items.map((item) => (
              <Pressable
                key={item.label}
                accessibilityRole="menuitem"
                accessibilityState={{ disabled: item.isDisabled }}
                disabled={item.isDisabled}
                onPress={() => handleItemPress(item)}
                style={({ pressed }) => [
                  styles.item,
                  pressed && styles.itemPressed,
                  item.isDisabled && styles.itemDisabled,
                ]}
              >
                {item.icon && (
                  <PIcon
                    name={item.icon}
                    size={iconSize.md}
                    color={colors.primary}
                  />
                )}
                <Text style={styles.itemLabel}>{item.label}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  menu: {
    position: 'absolute',
    minWidth: MENU_MIN_WIDTH,
    padding: spacing.sm,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background,
    ...shadows.md,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  itemPressed: {
    backgroundColor: colors.softHighlight,
  },
  itemDisabled: {
    opacity: opacity.muted,
  },
  itemLabel: {
    ...textPresets.body,
  },
});
