import React, { useState } from 'react';
import { ScrollView, Text, Pressable } from 'react-native';

import {
  PInput,
  PButton,
  PIcon,
  colors,
  iconSize,
  typography,
} from '../../../src';

import { ShowcaseSection } from './ShowcaseSection';
import { showcaseStyles as styles } from './showcaseStyles';

const EyeIcon = ({ isVisible }: { isVisible: boolean }) => (
  <Text style={{ fontSize: typography.sizes.md }}>
    {isVisible ? '👁️' : '🙈'}
  </Text>
);

export const InputScreen = () => {
  const [searchValue, setSearchValue] = useState('');
  const [emailValue, setEmailValue] = useState('');
  const [passwordValue, setPasswordValue] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [emailError, setEmailError] = useState('');

  const handleValidationTest = () => {
    setEmailError(
      emailValue.includes('@') ? '' : 'Please enter a valid email address'
    );
  };

  const handleEmailChange = (text: string) => {
    setEmailValue(text);
    if (emailError) setEmailError('');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ShowcaseSection title="Standard Inputs">
        <PInput
          label="Item Name"
          placeholder="e.g., Organic Whole Milk"
          helperText="Enter the exact product name from the receipt"
        />
        <PInput
          label="Storage Location"
          placeholder="e.g., Main Fridge - Top Shelf"
        />
      </ShowcaseSection>

      <ShowcaseSection title="Icon Integration">
        <PInput
          label="Search Inventory"
          placeholder="Search by name, category, or SKU..."
          value={searchValue}
          onChangeText={setSearchValue}
          leftIcon={
            <PIcon name="search" size={iconSize.md} color={colors.textMuted} />
          }
        />
        <PInput
          label="Password"
          placeholder="Enter secure password"
          secureTextEntry={!isPasswordVisible}
          autoComplete="password"
          textContentType="password"
          autoCapitalize="none"
          autoCorrect={false}
          value={passwordValue}
          onChangeText={setPasswordValue}
          rightIcon={
            <Pressable
              onPress={() => setIsPasswordVisible((isVisible) => !isVisible)}
            >
              <EyeIcon isVisible={isPasswordVisible} />
            </Pressable>
          }
        />
      </ShowcaseSection>

      <ShowcaseSection title="Validation">
        <PInput
          label="Account Email"
          placeholder="user@example.com"
          keyboardType="email-address"
          autoComplete="email"
          textContentType="emailAddress"
          autoCapitalize="none"
          autoCorrect={false}
          value={emailValue}
          error={emailError}
          helperText={!emailError ? 'We never share your email.' : undefined}
          onChangeText={handleEmailChange}
        />
        <PButton
          title="Validate Email"
          variant="secondary"
          onPress={handleValidationTest}
        />
      </ShowcaseSection>

      <ShowcaseSection title="Disabled State">
        <PInput
          label="System Identifier (Disabled)"
          value="SYS-PNTR-8842-X"
          disabled
          helperText="This identifier is automatically assigned by the server"
        />
      </ShowcaseSection>
    </ScrollView>
  );
};
