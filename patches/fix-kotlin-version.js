const fs = require('fs');
const path = require('path');

// Define paths
const nodeModulesDir = path.join(__dirname, '..', 'node_modules');
const expoModulesCoreDir = path.join(nodeModulesDir, 'expo-modules-core', 'android');

// Create a custom gradle.properties file with the suppression flag
const gradlePropertiesPath = path.join(expoModulesCoreDir, 'gradle.properties');
const gradlePropertiesContent = `
# Suppress Kotlin version compatibility check
android.suppressKotlinVersionCompatibilityCheck=true
kotlin.suppressKotlinVersionCompatibilityCheck=true
`;

console.log(`Writing to ${gradlePropertiesPath}`);
fs.writeFileSync(gradlePropertiesPath, gradlePropertiesContent);

// Create a custom file to be included in the build process
const kotlinFixPath = path.join(expoModulesCoreDir, 'kotlin-fix.gradle');
const kotlinFixContent = `
allprojects {
    tasks.withType(org.jetbrains.kotlin.gradle.tasks.KotlinCompile).configureEach {
        kotlinOptions {
            freeCompilerArgs += [
                "-P",
                "plugin:androidx.compose.compiler.plugins.kotlin:suppressKotlinVersionCompatibilityCheck=true"
            ]
        }
    }
}
`;

console.log(`Writing to ${kotlinFixPath}`);
fs.writeFileSync(kotlinFixPath, kotlinFixContent);

// Modify the build.gradle file to apply the kotlin-fix.gradle file
const buildGradlePath = path.join(expoModulesCoreDir, 'build.gradle');
let buildGradleContent = fs.readFileSync(buildGradlePath, 'utf8');

// Add the apply from statement after the plugin applications
const applyFromStatement = `
// Apply Kotlin version compatibility fix
apply from: "kotlin-fix.gradle"
`;

// Insert after the last apply statement
const lastApplyIndex = buildGradleContent.lastIndexOf('apply ');
const lastApplyLineEndIndex = buildGradleContent.indexOf('\n', lastApplyIndex);
if (lastApplyIndex !== -1 && lastApplyLineEndIndex !== -1) {
  buildGradleContent = 
    buildGradleContent.substring(0, lastApplyLineEndIndex + 1) + 
    applyFromStatement + 
    buildGradleContent.substring(lastApplyLineEndIndex + 1);
  
  console.log(`Modifying ${buildGradlePath}`);
  fs.writeFileSync(buildGradlePath, buildGradleContent);
} else {
  console.error('Could not find a suitable location to insert the apply from statement');
}

console.log('Kotlin version compatibility fix applied successfully!'); 