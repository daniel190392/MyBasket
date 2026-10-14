import { TurboModuleRegistry } from 'react-native';

import type { TurboModule } from 'react-native';

// Codegen reads this file to generate the native base class, so the signature
// here is the contract the Kotlin (and later Swift) implementation must meet.
export interface Spec extends TurboModule {
  report(event: string): Promise<void>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('HostEvents');
