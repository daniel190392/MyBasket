import { TurboModuleRegistry } from 'react-native';

import type { TurboModule } from 'react-native';

// Codegen reads this file to generate the native base class, so the signatures
// here are the contract the Kotlin (and later Swift) implementation must meet.
export interface Spec extends TurboModule {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('SecureStorage');
