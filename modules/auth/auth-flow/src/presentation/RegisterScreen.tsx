import React from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  PButton,
  PInput,
  PLink,
  colors,
  spacing,
  textPresets,
  typography,
} from 'ui-components';

import { registerStrings } from './strings';
import { useRegisterForm } from './useRegisterForm';

import type { ImageSourcePropType } from 'react-native';

const LOGO_SIZE = 160;
const SUBMIT_ERROR_MIN_HEIGHT = 48;

export type RegisterScreenProps = {
  logo?: ImageSourcePropType;
  onSignInPress: () => void;
};

export function RegisterScreen({
  logo = require('./assets/logo.png'),
  onSignInPress,
}: RegisterScreenProps) {
  const {
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    displayName,
    setDisplayName,
    fieldErrors,
    submitErrorCode,
    isSubmitting,
    submit,
  } = useRegisterForm();

  const fieldError = (code?: keyof typeof registerStrings.fieldErrors) =>
    code ? registerStrings.fieldErrors[code] : undefined;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Image
          source={logo}
          style={styles.logo}
          resizeMode="contain"
          accessibilityLabel={registerStrings.logoLabel}
        />
        <Text style={styles.title} accessibilityRole="header">
          {registerStrings.title}
        </Text>

        <PInput
          value={email}
          onChangeText={setEmail}
          placeholder={registerStrings.emailPlaceholder}
          accessibilityLabel={registerStrings.emailPlaceholder}
          error={fieldError(fieldErrors.email)}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect={false}
        />
        <PInput
          value={password}
          onChangeText={setPassword}
          placeholder={registerStrings.passwordPlaceholder}
          accessibilityLabel={registerStrings.passwordPlaceholder}
          error={fieldError(fieldErrors.password)}
          secureTextEntry
          autoCapitalize="none"
          autoComplete="password-new"
        />
        <PInput
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder={registerStrings.confirmPasswordPlaceholder}
          accessibilityLabel={registerStrings.confirmPasswordPlaceholder}
          error={fieldError(fieldErrors.confirmPassword)}
          secureTextEntry
          autoCapitalize="none"
          autoComplete="password-new"
        />
        <PInput
          value={displayName}
          onChangeText={setDisplayName}
          placeholder={registerStrings.displayNamePlaceholder}
          accessibilityLabel={registerStrings.displayNamePlaceholder}
          error={fieldError(fieldErrors.displayName)}
          autoCapitalize="words"
          autoComplete="name"
        />

        <View style={styles.submitError}>
          {submitErrorCode && (
            <Text style={styles.submitErrorText} accessibilityRole="alert">
              {registerStrings.submitErrors[submitErrorCode]}
            </Text>
          )}
        </View>

        <PButton
          title={registerStrings.submit}
          onPress={submit}
          isLoading={isSubmitting}
        />

        <View style={styles.links}>
          <PLink
            text={registerStrings.signInPrompt}
            link={registerStrings.signIn}
            align="center"
            onPress={onSignInPress}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xxl,
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
  title: {
    ...textPresets.title,
    fontSize: typography.sizes['4xl'],
    fontWeight: typography.weights.regular,
    marginTop: spacing.lg,
    marginBottom: spacing.xxl,
  },
  submitError: {
    width: '100%',
    minHeight: SUBMIT_ERROR_MIN_HEIGHT,
    justifyContent: 'center',
  },
  submitErrorText: {
    ...textPresets.caption,
    color: colors.error,
    textAlign: 'center',
  },
  links: {
    width: '100%',
    marginTop: spacing.lg,
    gap: spacing.lg,
  },
});
