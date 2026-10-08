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
import { confirmationStrings } from './strings';
import { useConfirmationForm } from './useConfirmationForm';

import type { ImageSourcePropType } from 'react-native';

const LOGO_SIZE = 160;
const FEEDBACK_MIN_HEIGHT = 48;

export type ConfirmationScreenProps = {
  logo?: ImageSourcePropType;
  /** Email the confirmation code was sent to. */
  email: string;
  onConfirmed: () => void;
  onBackPress: () => void;
};

export function ConfirmationScreen({
  logo = require('./assets/logo.png'),
  email,
  onConfirmed,
  onBackPress,
}: ConfirmationScreenProps) {
  const {
    code,
    setCode,
    fieldErrors,
    submitErrorCode,
    isSubmitting,
    isCodeResent,
    resendSecondsLeft,
    canResend,
    submit,
    resend,
  } = useConfirmationForm(email, onConfirmed);

  const fieldError = (code?: keyof typeof confirmationStrings.fieldErrors) =>
    code ? confirmationStrings.fieldErrors[code] : undefined;

  const resendLabel = canResend
    ? confirmationStrings.resend
    : `${confirmationStrings.resendIn} ${resendSecondsLeft}s`;

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
          accessibilityLabel={confirmationStrings.logoLabel}
        />
        <Text style={styles.title} accessibilityRole="header">
          {confirmationStrings.title}
        </Text>
        <Text style={styles.description}>
          {confirmationStrings.description}
        </Text>
        <Text style={styles.email}>{email}</Text>

        <PInput
          value={code}
          onChangeText={setCode}
          placeholder={confirmationStrings.codePlaceholder}
          accessibilityLabel={confirmationStrings.codePlaceholder}
          error={fieldError(fieldErrors.code)}
          keyboardType="number-pad"
          maxLength={CONFIRMATION_CODE_LENGTH}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <View style={styles.feedback}>
          {submitErrorCode && (
            <Text style={styles.errorText} accessibilityRole="alert">
              {confirmationStrings.submitErrors[submitErrorCode]}
            </Text>
          )}
          {isCodeResent && (
            <Text style={styles.successText} accessibilityRole="alert">
              {confirmationStrings.resentMessage}
            </Text>
          )}
        </View>

        <PButton
          title={confirmationStrings.submit}
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
            link={confirmationStrings.backToSignIn}
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
