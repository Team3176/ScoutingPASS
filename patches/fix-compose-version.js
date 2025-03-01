const fs = require('fs');
const path = require('path');

// Define paths
const nodeModulesDir = path.join(__dirname, '..', 'node_modules');
const expoModulesCoreDir = path.join(nodeModulesDir, 'expo-modules-core', 'android');
const buildGradlePath = path.join(expoModulesCoreDir, 'build.gradle');

// Read the build.gradle file
let buildGradleContent = fs.readFileSync(buildGradlePath, 'utf8');

// Replace the Compose compiler version with one compatible with Kotlin 1.9.25
buildGradleContent = buildGradleContent.replace(
  /kotlinCompilerExtensionVersion = "1\.5\.14"/g,
  'kotlinCompilerExtensionVersion = "1.5.15"'
);

// Write the modified content back to the file
console.log(`Modifying ${buildGradlePath}`);
fs.writeFileSync(buildGradlePath, buildGradleContent);

console.log('Compose compiler version updated successfully!'); 