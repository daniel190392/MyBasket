export * from './domain/types';
export * from './domain/errors';
export * from './domain/validation';
export type { AuthProvider } from './domain/AuthProvider';
export type { SessionStorage } from './domain/SessionStorage';

export * from './data/MockAuthProvider';
export * from './data/InMemorySessionStorage';
export * from './data/RemoteAuthProvider';

export { AuthService } from './application/AuthService';
export { AuthSessionProvider } from './application/AuthSessionProvider';
export type { AuthSessionProviderProps } from './application/AuthSessionProvider';
export { useAuth } from './application/useAuth';

export { LoginScreen } from './presentation/LoginScreen';
export type { LoginScreenProps } from './presentation/LoginScreen';
export { RegisterScreen } from './presentation/RegisterScreen';
export type { RegisterScreenProps } from './presentation/RegisterScreen';
export { ConfirmationScreen } from './presentation/ConfirmationScreen';
export type { ConfirmationScreenProps } from './presentation/ConfirmationScreen';
export { RecoveryScreen } from './presentation/RecoveryScreen';
export type { RecoveryScreenProps } from './presentation/RecoveryScreen';
