import React, { useState } from 'react';
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PButton, colors, spacing, textPresets } from 'ui-components';

import { SideMenu } from '../src';

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasSignedOut, setHasSignedOut] = useState(false);

  const handleSignOutPress = () => {
    setHasSignedOut(true);
    setIsMenuOpen(false);
  };

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <View style={styles.screen}>
        <Text style={styles.title}>Side menu</Text>
        {hasSignedOut && <Text style={styles.message}>Signed out</Text>}
        <PButton title="Open menu" onPress={() => setIsMenuOpen(true)} />
      </View>
      <SideMenu
        isOpen={isMenuOpen}
        userName="Ana Gómez"
        onClose={() => setIsMenuOpen(false)}
        onSignOutPress={handleSignOutPress}
      />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xxl,
    gap: spacing.lg,
    backgroundColor: colors.background,
  },
  title: {
    ...textPresets.title,
  },
  message: {
    ...textPresets.caption,
  },
});
