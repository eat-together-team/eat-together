const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// svg support via react-native-svg-transformer
const { transformer, resolver } = config;
config.transformer = {
  ...transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer'),
};

// firebase/compat (the RN entry) and firebase/compat/app resolve
// @firebase/app-compat to two different builds. Auth, Firestore, and Storage
// register themselves on the compat/app copy, so `firebase.auth()` on the
// other copy throws "undefined is not a function".
const appCompatEntry = path.resolve(
  __dirname,
  'node_modules/@firebase/app-compat/dist/esm/index.esm2017.js',
);
const previousResolveRequest = resolver.resolveRequest;

config.resolver = {
  ...resolver,
  assetExts: resolver.assetExts.filter((ext) => ext !== 'svg'),
  sourceExts: [...resolver.sourceExts, 'svg'],
  resolveRequest(context, moduleName, platform) {
    if (moduleName === '@firebase/app-compat') {
      return { type: 'sourceFile', filePath: appCompatEntry };
    }
    if (previousResolveRequest) {
      return previousResolveRequest(context, moduleName, platform);
    }
    return context.resolveRequest(context, moduleName, platform);
  },
};

module.exports = config;
