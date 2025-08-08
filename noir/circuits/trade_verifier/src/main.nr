/**
 * Simple Trade Verifier Circuit
 * Proves knowledge of valid trade parameters without revealing:
 * - Trade size (amount in USDC/HBAR)
 * - Trade direction (long/short)
 * - Trading pair selection
 */

use std::hash::keccak256;

fn main(
    // Private inputs (hidden from public)
    trade_size: Field,      // Amount to trade (e.g., 50 USDC)
    is_long: bool,          // true = long, false = short
    pair_id: Field,         // 0=HBAR/USD, 1=BTC/USD, 2=ETH/USD, 3=SOL/USD
    trader_secret: Field,   // Random nonce for uniqueness
    
    // Public inputs (visible on-chain)
    pub commitment: Field,     // Hash of private inputs
    pub trader_address: Field, // Trader's wallet address
    pub min_size: Field,       // Minimum trade size (e.g., 1 USDC)
    pub max_size: Field        // Maximum trade size (e.g., 10000 USDC)
) {
    // === CONSTRAINT 1: Trade size bounds ===
    assert(trade_size >= min_size);
    assert(trade_size <= max_size);
    
    // === CONSTRAINT 2: Valid trading pair ===
    assert(pair_id <= 3); // Only support 4 pairs for now
    
    // === CONSTRAINT 3: Valid direction ===
    // Convert bool to field for hashing
    let direction_field = if is_long { 1 } else { 0 };
    
    // === CONSTRAINT 4: Commitment verification ===
    // Recreate the commitment hash from private inputs
    let inputs = [trade_size, direction_field, pair_id, trader_secret];
    let computed_hash = keccak256(inputs, 32);
    
    // Convert computed hash to field for comparison
    let computed_commitment = computed_hash[0] as Field 
        + (computed_hash[1] as Field) * 256
        + (computed_hash[2] as Field) * 256 * 256  
        + (computed_hash[3] as Field) * 256 * 256 * 256;
    
    // Verify the commitment matches
    assert(commitment == computed_commitment);
    
    // === SUCCESS ===
    // If we reach here, the prover knows valid trade parameters
    // that hash to the given commitment, without revealing them!
}
