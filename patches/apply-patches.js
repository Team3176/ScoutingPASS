const fs = require('fs');
const path = require('path');

// Define paths
const patchesDir = path.join(__dirname);
const nodeModulesDir = path.join(__dirname, '..', 'node_modules');

// Copy expo-modules-core build.gradle
const expoModulesCoreSourcePath = path.join(patchesDir, 'expo-modules-core', 'android', 'build.gradle');
const expoModulesCoreTargetPath = path.join(nodeModulesDir, 'expo-modules-core', 'android', 'build.gradle');

// Create backup of original file
const backupPath = `${expoModulesCoreTargetPath}.backup`;
if (!fs.existsSync(backupPath)) {
  console.log(`Creating backup of ${expoModulesCoreTargetPath} to ${backupPath}`);
  fs.copyFileSync(expoModulesCoreTargetPath, backupPath);
}

// Copy patched file
console.log(`Copying patched file from ${expoModulesCoreSourcePath} to ${expoModulesCoreTargetPath}`);
fs.copyFileSync(expoModulesCoreSourcePath, expoModulesCoreTargetPath);

// Copy expo-modules-core gradle.properties
const expoModulesCorePropsSourcePath = path.join(patchesDir, 'expo-modules-core', 'android', 'gradle.properties');
const expoModulesCorePropsTargetPath = path.join(nodeModulesDir, 'expo-modules-core', 'android', 'gradle.properties');

// Copy patched file
console.log(`Copying patched file from ${expoModulesCorePropsSourcePath} to ${expoModulesCorePropsTargetPath}`);
fs.copyFileSync(expoModulesCorePropsSourcePath, expoModulesCorePropsTargetPath);

console.log('Patches applied successfully!'); 