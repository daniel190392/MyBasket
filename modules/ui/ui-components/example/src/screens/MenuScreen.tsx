import React from 'react';
import { ScrollView, View } from 'react-native';

import { PIconButton, PMenu } from '../../../src';

import { ShowcaseSection } from './ShowcaseSection';
import { showcaseStyles as styles } from './showcaseStyles';

const noop = () => undefined;

const ITEMS = [
  { label: 'Edit', icon: 'edit', onPress: noop },
  { label: 'Delete', icon: 'trash', onPress: noop },
  { label: 'Sort (soon)', onPress: noop, isDisabled: true },
] as const;

export const MenuScreen = () => (
  <ScrollView style={styles.container} contentContainerStyle={styles.content}>
    <ShowcaseSection title="Opens under its trigger">
      <View style={{ alignItems: 'flex-end' }}>
        <PMenu
          items={[...ITEMS]}
          renderTrigger={(open) => (
            <PIconButton
              icon="more"
              accessibilityLabel="More options"
              onPress={open}
            />
          )}
        />
      </View>
    </ShowcaseSection>
  </ScrollView>
);
