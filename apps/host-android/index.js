import { AppRegistry } from 'react-native';

import { AuthRoot } from './src/auth/AuthRoot';
import { HomeRoot } from './src/home/HomeRoot';

// One entry point per native destination; the native host opens them by name.
AppRegistry.registerComponent('AuthRoot', () => AuthRoot);
AppRegistry.registerComponent('HomeRoot', () => HomeRoot);
