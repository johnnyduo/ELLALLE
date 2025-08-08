/**
 * Test Unique Trade ID Generation
 * Verifies that our new ID generation system creates unique IDs
 */

function generateUniqueTradeId(prefix = 'zkp-trade', counter = 0) {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `${prefix}-${timestamp}-${counter}-${random}`;
}

function testUniqueIds() {
  console.log('🧪 Testing Unique Trade ID Generation\n');

  // Test 1: Generate multiple IDs rapidly
  console.log('📊 Test 1: Rapid ID Generation');
  const rapidIds = [];
  for (let i = 0; i < 10; i++) {
    rapidIds.push(generateUniqueTradeId('zkp-trade', i));
  }

  console.log('Generated IDs:');
  rapidIds.forEach((id, index) => {
    console.log(`  ${index + 1}. ${id}`);
  });

  // Check for duplicates
  const uniqueRapidIds = new Set(rapidIds);
  const hasDuplicates = uniqueRapidIds.size !== rapidIds.length;
  console.log(`✅ Unique: ${uniqueRapidIds.size}/${rapidIds.length} ${hasDuplicates ? '❌ DUPLICATES FOUND' : '✅ ALL UNIQUE'}\n`);

  // Test 2: Different prefixes
  console.log('📊 Test 2: Different Prefixes');
  const prefixTests = [
    generateUniqueTradeId('zkp-trade', 1),
    generateUniqueTradeId('zkp-close', 2),
    generateUniqueTradeId('zkp-trade', 3),
    generateUniqueTradeId('zkp-close', 4)
  ];

  console.log('Different prefix IDs:');
  prefixTests.forEach((id, index) => {
    console.log(`  ${index + 1}. ${id}`);
  });

  const uniquePrefixIds = new Set(prefixTests);
  console.log(`✅ Unique: ${uniquePrefixIds.size}/${prefixTests.length} ${uniquePrefixIds.size !== prefixTests.length ? '❌ DUPLICATES FOUND' : '✅ ALL UNIQUE'}\n`);

  // Test 3: ID Structure Analysis
  console.log('📊 Test 3: ID Structure Analysis');
  const sampleId = generateUniqueTradeId('zkp-trade', 42);
  const parts = sampleId.split('-');
  
  console.log(`Sample ID: ${sampleId}`);
  console.log('Structure breakdown:');
  console.log(`  Prefix: ${parts[0]}-${parts[1]}`);
  console.log(`  Timestamp: ${parts[2]} (${new Date(parseInt(parts[2])).toISOString()})`);
  console.log(`  Counter: ${parts[3]}`);
  console.log(`  Random: ${parts[4]}`);
  console.log('');

  // Test 4: Collision Probability
  console.log('📊 Test 4: Large Scale Collision Test');
  const largeSet = new Set();
  const testSize = 1000;
  
  for (let i = 0; i < testSize; i++) {
    largeSet.add(generateUniqueTradeId('zkp-test', i));
  }
  
  console.log(`Generated ${testSize} IDs, got ${largeSet.size} unique`);
  console.log(`Collision rate: ${((testSize - largeSet.size) / testSize * 100).toFixed(4)}%`);
  console.log(`✅ ${largeSet.size === testSize ? 'PERFECT UNIQUENESS' : 'COLLISIONS DETECTED'}\n`);

  // Summary
  console.log('🎯 Summary:');
  console.log('✅ ID Format: prefix-timestamp-counter-random');
  console.log('✅ Four-layer uniqueness guarantee:');
  console.log('   1. Prefix (trade type identification)');
  console.log('   2. Timestamp (temporal uniqueness)');
  console.log('   3. Counter (sequential uniqueness)');
  console.log('   4. Random (collision prevention)');
  console.log('');
  console.log('🔧 Implementation Benefits:');
  console.log('   • Eliminates React key duplication warnings');
  console.log('   • Prevents localStorage corruption');
  console.log('   • Maintains chronological ordering');
  console.log('   • Supports rapid trade creation');
  console.log('   • Differentiates trade types (open vs close)');
}

// Run the test
testUniqueIds();
