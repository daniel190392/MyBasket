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

import { CONFIRMATION_CODE_LENGTH } from '../domain/validation';
import { resetPasswordStrings } from './strings';
import { useResetPasswordForm } from './useResetPasswordForm';

import type { ImageSourcePropType } from 'react-native';

const LOGO_SIZE = 160;
const FEEDBACK_MIN_HEIGHT = 48;

export type ResetPasswordScreenProps = {
  logo?: ImageSourcePropType;
  /** Email the recovery code was requested for. */
  email: string;
  onPasswordReset: () => void;
  onBackPress: () => void;
};

export function ResetPasswordScreen({
  logo = require('./assets/logo.png'),
  email,
  onPasswordReset,
  onBackPress,
}: ResetPasswordScreenProps) {
  const {
    code,
    setCode,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    fieldErrors,
    submitErrorCode,
    isSubmitting,
    isCodeResent,
    resendSecondsLeft,
    canResend,
    submit,
    resend,
  } = useResetPasswordForm(email, onPasswordReset);

  const fieldError = (code?: keyof typeof resetPasswordStrings.fieldErrors) =>
    code ? resetPasswordStrings.fieldErrors[code] : undefined;

  const resendLabel = canResend
    ? resetPasswordStrings.resend
    : `${resetPasswordStrings.resendIn} ${resendSecondsLeft}s`;

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
          accessibilityLabel={resetPasswordStrings.logoLabel}
        />
        <Text style={styles.title} accessibilityRole="header">
          {resetPasswordStrings.title}
        </Text>
        <Text style={styles.description}>
          {resetPasswordStrings.description}
        </Text>
        <Text style={styles.email}>{email}</Text>

        <PInput
          value={code}
          onChangeText={setCode}
          placeholder={resetPasswordStrings.codePlaceholder}
          accessibilityLabel={resetPasswordStrings.codePlaceholder}
          error={fieldError(fieldErrors.code)}
          keyboardType="number-pad"
          maxLength={CONFIRMATION_CODE_LENGTH}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <PInput
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder={resetPasswordStrings.newPasswordPlaceholder}
          accessibilityLabel={resetPasswordStrings.newPasswordPlaceholder}
          error={fieldError(fieldErrors.newPassword)}
          secureTextEntry
          autoCapitalize="none"
          autoComplete="password-new"
        />
        <PInput
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder={resetPasswordStrings.confirmPasswordPlaceholder}
          accessibilityLabel={resetPasswordStrings.confirmPasswordPlaceholder}
          error={fieldError(fieldErrors.confirmPassword)}
          secureTextEntry
          autoCapitalize="none"
          autoComplete="password-new"
        />

        <View style={styles.feedback}>
          {submitErrorCode && (
            <Text style={styles.errorText} accessibilityRole="alert">
              {resetPasswordStrings.submitErrors[submitErrorCode]}
            </Text>
          )}
          {isCodeResent && (
            <Text style={styles.successText} accessibilityRole="alert">
              {resetPasswordStrings.resentMessage}
            </Text>
          )}
        </View>

        <PButton
          title={resetPasswordStrings.submit}
          onPress={submit}
          isLoading={isSubmitting}
        />

        <View style={styles.links}>
          <PLink
            link={resendLabel}
            variant={canResend ? 'primary' : 'secondary'}
            align="center"
            disabled={!canResend}
            onPress={resend}
          />
          <PLink
            link={resetPasswordStrings.backToSignIn}
            align="center"
            onPress={onBackPress}
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
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  description: {
    ...textPresets.caption,
    textAlign: 'center',
  },
  email: {
    ...textPresets.caption,
    fontWeight: typography.weights.bold,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  feedback: {
    width: '100%',
    minHeight: FEEDBACK_MIN_HEIGHT,
    justifyContent: 'center',
  },
  errorText: {
    ...textPresets.caption,
    color: colors.error,
    textAlign: 'center',
  },
  successText: {
    ...textPresets.caption,
    color: colors.secondaryPressed,
    textAlign: 'center',
  },
  links: {
    width: '100%',
    marginTop: spacing.lg,
    gap: spacing.lg,
  },
});
