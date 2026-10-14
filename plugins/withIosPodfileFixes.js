const { withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

// ReachabilitySwift (a transitive dependency of expo-updates) hardcodes an
// old deployment target in its own podspec, which Xcode 26+ rejects
// outright. This has nothing to do with Firebase — it was needed before any
// of that work started, and stays needed regardless of it. Encoded as a
// plugin (rather than a hand-edit to the Podfile) because `expo prebuild`
// regenerates the Podfile from scratch on every run and wipes plain
// hand-edits — this re-applies the fix every time instead.
function withIosPodfileFixes(config) {
  return withDangerousMod(config, [
    "ios",
    (config) => {
      const podfilePath = path.join(
        config.modRequest.platformProjectRoot,
        "Podfile"
      );
      let contents = fs.readFileSync(podfilePath, "utf-8");

      const reactNativePostInstallCallEnd =
        ":ccache_enabled => ccache_enabled?(podfile_properties),\n    )";
      if (
        !contents.includes("IPHONEOS_DEPLOYMENT_TARGET'] = '15.1'") &&
        contents.includes(reactNativePostInstallCallEnd)
      ) {
        const insertion = `${reactNativePostInstallCallEnd}

    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |build_config|
        if build_config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'].to_f < 15.1
          build_config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '15.1'
        end
      end
    end`;
        contents = contents.replace(reactNativePostInstallCallEnd, insertion);
      }

      fs.writeFileSync(podfilePath, contents);
      return config;
    },
  ]);
}

module.exports = withIosPodfileFixes;
