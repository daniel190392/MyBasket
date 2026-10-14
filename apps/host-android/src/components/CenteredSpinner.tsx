import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { colors } from 'ui-components';

export function CenteredSpinner() {
  return (
    <View style={styles.container}>
      <ActivityIndicator color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
