const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../../..');
const SINGLETON_PACKAGES = ['react', 'react-native'];

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// The module has its own react / react-native devDependencies. Bundling both
// copies crashes at runtime (PlatformConstants not found), so these packages
// are always resolved as if imported from the example.
const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  const isSingleton = SINGLETON_PACKAGES.some(
    (name) => moduleName === name || moduleName.startsWith(`${name}/`)
  );
  const resolveRequest = defaultResolveRequest ?? context.resolveRequest;

  if (!isSingleton) {
    return resolveRequest(context, moduleName, platform);
  }

  return resolveRequest(
    {
      ...context,
      originModulePath: path.join(projectRoot, 'index.ts'),
    },
    moduleName,
    platform
  );
};

module.exports = config;
