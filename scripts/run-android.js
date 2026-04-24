#!/usr/bin/env node
/**
 * Android Gradle (8.x) + AGP do not support running the build on JDK 25 yet.
 * Error: "Unsupported class file major version 69"
 * This script prefers JDK 21 or 17 on macOS before invoking Expo.
 */
const { spawnSync } = require("child_process");
const path = require("path");

function macJavaHome(version) {
  const r = spawnSync("/usr/libexec/java_home", ["-v", String(version)], { encoding: "utf8" });
  if (r.status !== 0) return null;
  const home = (r.stdout || "").trim();
  return home || null;
}

function javaMajorFromHome(javaHome) {
  const javaBin = path.join(javaHome, process.platform === "win32" ? "bin\\java.exe" : "bin/java");
  const r = spawnSync(javaBin, ["-version"], { encoding: "utf8" });
  const text = `${r.stderr || ""}${r.stdout || ""}`;
  const m = text.match(/version "(\d+)/);
  return m ? parseInt(m[1], 10) : null;
}

let javaHome = process.env.JAVA_HOME;

if (process.platform === "darwin") {
  javaHome = macJavaHome(21) || macJavaHome(17) || macJavaHome(11) || javaHome;
}

if (!javaHome) {
  console.error(
    "[eat-together] Set JAVA_HOME to JDK 17 or 21. Java 25 breaks Android builds (class file version 69).\n" +
      "  macOS: brew install --cask temurin@21 && export JAVA_HOME=$(/usr/libexec/java_home -v 21)"
  );
  process.exit(1);
}

const major = javaMajorFromHome(javaHome);
if (major != null && major >= 25) {
  console.error(
    `[eat-together] JAVA_HOME is Java ${major}. Use JDK 21 for Android builds.\n` +
      "  macOS: brew install --cask temurin@21\n" +
      "  Then:  export JAVA_HOME=$(/usr/libexec/java_home -v 21)\n" +
      "  Or run: npm run android   (auto-picks 21/17 on macOS if installed)"
  );
  process.exit(1);
}

const npx = process.platform === "win32" ? "npx.cmd" : "npx";
const result = spawnSync(npx, ["expo", "run:android", ...process.argv.slice(2)], {
  stdio: "inherit",
  env: { ...process.env, JAVA_HOME: javaHome },
});
process.exit(result.status == null ? 1 : result.status);
