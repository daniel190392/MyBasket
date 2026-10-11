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

import { loginStrings } from './strings';
import { useLoginForm } from './useLoginForm';

import type { ImageSourcePropType } from 'react-native';

const LOGO_SIZE = 160;
const SUBMIT_ERROR_MIN_HEIGHT = 48;

export type LoginScreenProps = {
  logo?: ImageSourcePropType;
  onForgotPasswordPress: () => void;
  onSignUpPress: () => void;
  /** Pre-fills the email, for example after confirming an account. */
  initialEmail?: string;
};

export function LoginScreen({
  logo = require('./assets/logo.png'),
  onForgotPasswordPress,
  onSignUpPress,
  initialEmail,
}: LoginScreenProps) {
  const {
    email,
    setEmail,
    password,
    setPassword,
    fieldErrors,
    submitErrorCode,
    isSubmitting,
    submit,
  } = useLoginForm(initialEmail);

  const fieldError = (code?: keyof typeof loginStrings.fieldErrors) =>
    code ? loginStrings.fieldErrors[code] : undefined;

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
          accessibilityLabel={loginStrings.logoLabel}
        />
        <Text style={styles.title} accessibilityRole="header">
          {loginStrings.title}
        </Text>

        <PInput
          value={email}
          onChangeText={setEmail}
          placeholder={loginStrings.emailPlaceholder}
          accessibilityLabel={loginStrings.emailPlaceholder}
          error={fieldError(fieldErrors.email)}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect={false}
        />
        <PInput
          value={password}
          onChangeText={setPassword}
          placeholder={loginStrings.passwordPlaceholder}
          accessibilityLabel={loginStrings.passwordPlaceholder}
          error={fieldError(fieldErrors.password)}
          secureTextEntry
          autoCapitalize="none"
          autoComplete="password"
        />

        <View style={styles.submitError}>
          {submitErrorCode && (
            <Text style={styles.submitErrorText} accessibilityRole="alert">
              {loginStrings.submitErrors[submitErrorCode]}
            </Text>
          )}
        </View>

        <PButton
          title={loginStrings.submit}
          onPress={submit}
          isLoading={isSubmitting}
        />

        <View style={styles.links}>
          <PLink
            link={loginStrings.forgotPassword}
            variant="secondary"
            align="center"
            onPress={onForgotPasswordPress}
          />
          <PLink
            text={loginStrings.signUpPrompt}
            link={loginStrings.signUp}
            align="center"
            onPress={onSignUpPress}
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
