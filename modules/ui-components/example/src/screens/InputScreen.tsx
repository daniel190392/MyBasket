import React, { useLayoutEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PInput, PButton, PCard } from '../../../src';
import { colors, spacing, textPresets, typography } from '../../../src';

const SearchIcon = () => (
  <Text style={{ fontSize: typography.sizes.md, color: colors.surface }}>
    🔍
  </Text>
);
const EyeIcon = ({ visible }: { visible: boolean }) => (
  <Text style={{ fontSize: typography.sizes.md, color: colors.surface }}>
    {visible ? '👁️' : '🙈'}
  </Text>
);

export const InputScreen = ({ navigation }: any) => {
  const [searchValue, setSearchValue] = useState('');
  const [emailValue, setEmailValue] = useState('');
  const [passwordValue, setPasswordValue] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'PInput',
    });
  }, [navigation]);

  const handleValidationTest = () => {
    if (!emailValue.includes('@')) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <PCard>
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>Standard Inputs</Text>
            <PInput
              label="Item Name"
              placeholder="e.g., Organic Whole Milk"
              helperText="Enter the exact product name from the receipt"
            />

            <PInput
              label="Storage Location"
              placeholder="e.g., Main Fridge - Top Shelf"
            />
          </View>
        </PCard>
        <PCard>
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>Icon Integration</Text>
            <PInput
              label="Search Inventory"
              placeholder="Search by name, category, or SKU..."
              value={searchValue}
              onChangeText={setSearchValue}
              leftIcon={<SearchIcon />}
            />

            <PInput
              label="Password"
              placeholder="Enter secure password"
              secureTextEntry={!showPassword}
              autoComplete="password"
              textContentType="password"
              autoCapitalize="none"
              autoCorrect={false}
              value={passwordValue}
              onChangeText={setPasswordValue}
              rightIcon={
                <Pressable onPress={() => setShowPassword(!showPassword)}>
                  <EyeIcon visible={showPassword} />
                </Pressable>
              }
            />
          </View>
        </PCard>
        <PCard>
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>Validation</Text>
            <PInput
              label="Account Email"
              placeholder="user@pantryhub.io"
              keyboardType="email-address"
              autoComplete="email"
              textContentType="emailAddress"
              autoCapitalize="none"
              autoCorrect={false}
              value={emailValue}
              error={emailError}
              helperText={
                !emailError ? 'We never share your email.' : undefined
              }
              onChangeText={(text: React.SetStateAction<string>) => {
                setEmailValue(text);
                if (emailError) setEmailError('');
              }}
            />
            <PButton
              title="Validate Email"
              variant="secondary"
              onPress={handleValidationTest}
            />
          </View>
        </PCard>
        <PCard>
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>Disabled State</Text>
            <PInput
              label="System Identifier (Disabled)"
              value="SYS-PNTR-8842-X"
              disabled
              helperText="This identifier is automatically assigned by the server"
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
    ...textPresets.title,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
});
