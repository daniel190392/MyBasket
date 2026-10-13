import NativeSecureStorage from './NativeSecureStorage';

import type { SecureStorage } from './SecureStorage';

export type { SecureStorage };

export const secureStorage: SecureStorage = NativeSecureStorage;
