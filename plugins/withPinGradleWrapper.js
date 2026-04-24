const { withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

/** Must match gradle-wrapper.properties escaping rules */
const DISTRIBUTION_URL_LINE =
  "distributionUrl=https\\://services.gradle.org/distributions/gradle-8.13-bin.zip";

/**
 * Prebuild templates may set Gradle 9.x, which breaks Foojay JVM toolchain resolution:
 * NoSuchFieldError: JvmVendorSpec IBM_SEMERU
 * Pin Gradle 8.13 after the android project is written.
 */
function withPinGradleWrapper(config) {
  return withDangerousMod(config, [
    "android",
    async (cfg) => {
      const root = cfg.modRequest.platformProjectRoot;
      const propsPath = path.join(root, "gradle", "wrapper", "gradle-wrapper.properties");
      if (!fs.existsSync(propsPath)) {
        return cfg;
      }
      const text = fs.readFileSync(propsPath, "utf8");
      const next = text.replace(/^distributionUrl=.*$/m, DISTRIBUTION_URL_LINE);
      fs.writeFileSync(propsPath, next);
      return cfg;
    },
  ]);
}

module.exports = withPinGradleWrapper;
