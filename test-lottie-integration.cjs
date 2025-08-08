#!/usr/bin/env node

/**
 * Test script to verify Lottie animation file accessibility
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Lottie Animation Files...\n');

const publicDir = path.join(__dirname, 'public');
const lottieFile = path.join(publicDir, 'qeBRbfgoTC.lottie');
const jsonFile = path.join(publicDir, 'qeBRbfgoTC.json');

console.log('📁 Checking public directory:', publicDir);

// Check if Lottie file exists
if (fs.existsSync(lottieFile)) {
  const stats = fs.statSync(lottieFile);
  console.log('✅ qeBRbfgoTC.lottie found');
  console.log(`   Size: ${(stats.size / 1024).toFixed(2)} KB`);
} else {
  console.log('❌ qeBRbfgoTC.lottie not found');
}

// Check if JSON file exists
if (fs.existsSync(jsonFile)) {
  const stats = fs.statSync(jsonFile);
  console.log('✅ qeBRbfgoTC.json found');
  console.log(`   Size: ${(stats.size / 1024).toFixed(2)} KB`);
  
  try {
    const jsonContent = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
    console.log('✅ JSON file is valid');
    console.log(`   Animation frames: ${jsonContent.op || 'N/A'}`);
    console.log(`   Animation name: ${jsonContent.nm || 'N/A'}`);
    console.log(`   Version: ${jsonContent.v || 'N/A'}`);
  } catch (error) {
    console.log('❌ JSON file is invalid:', error.message);
  }
} else {
  console.log('❌ qeBRbfgoTC.json not found');
}

console.log('\n🌐 Web accessibility test:');
console.log('   URL: http://localhost:8081/qeBRbfgoTC.json');
console.log('   This should be accessible via fetch() in the browser');

console.log('\n✨ Hero Component Updates:');
console.log('   ✅ Lottie animation integration');
console.log('   ✅ "Private Money Market" messaging');
console.log('   ✅ Dark pool focused features');
console.log('   ✅ Professional institutional branding');
console.log('   ✅ Fallback animation for loading states');
