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

import { recoveryStrings } from './strings';
import { useRecoveryForm } from './useRecoveryForm';

import type { ImageSourcePropType } from 'react-native';

const LOGO_SIZE = 160;
const FEEDBACK_MIN_HEIGHT = 48;

export type RecoveryScreenProps = {
  logo?: ImageSourcePropType;
  onSignInPress: () => void;
};

export function RecoveryScreen({
  logo = require('./assets/logo.png'),
  onSignInPress,
}: RecoveryScreenProps) {
  const {
    email,
    setEmail,
    fieldErrors,
    submitErrorCode,
    isSubmitting,
    isRequestSent,
    submit,
  } = useRecoveryForm();

  const fieldError = (code?: keyof typeof recoveryStrings.fieldErrors) =>
    code ? recoveryStrings.fieldErrors[code] : undefined;

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
          accessibilityLabel={recoveryStrings.logoLabel}
        />
        <Text style={styles.title} accessibilityRole="header">
          {recoveryStrings.title}
        </Text>
        <Text style={styles.description}>{recoveryStrings.description}</Text>

        <PInput
          value={email}
          onChangeText={setEmail}
          placeholder={recoveryStrings.emailPlaceholder}
          accessibilityLabel={recoveryStrings.emailPlaceholder}
          error={fieldError(fieldErrors.email)}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect={false}
        />

        <View style={styles.feedback}>
          {submitErrorCode && (
            <Text style={styles.errorText} accessibilityRole="alert">
              {recoveryStrings.submitErrors[submitErrorCode]}
            </Text>
          )}
          {isRequestSent && (
            <Text style={styles.successText} accessibilityRole="alert">
              {recoveryStrings.successMessage}
            </Text>
          )}
        </View>

        <PButton
          title={recoveryStrings.submit}
          onPress={submit}
          isLoading={isSubmitting}
        />

        <View style={styles.links}>
          <PLink
            link={recoveryStrings.backToSignIn}
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
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  description: {
    ...textPresets.caption,
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
