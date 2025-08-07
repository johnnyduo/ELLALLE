// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

library MathLib {
    error MathOverflow();
    error DivisionByZero();
    
    uint256 internal constant PRECISION = 1e18;
    uint256 internal constant BASIS_POINTS = 10000;
    
    function mulDiv(
        uint256 x,
        uint256 y,
        uint256 z
    ) internal pure returns (uint256) {
        if (z == 0) revert DivisionByZero();
        return (x * y) / z;
    }
    
    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }
    
    function max(uint256 a, uint256 b) internal pure returns (uint256) {
        return a > b ? a : b;
    }
    
    function abs(int256 x) internal pure returns (uint256) {
        return x >= 0 ? uint256(x) : uint256(-x);
    }
    
    function percentageOf(uint256 value, uint256 percentage) internal pure returns (uint256) {
        return mulDiv(value, percentage, BASIS_POINTS);
    }
    
    function addSigned(uint256 a, int256 b) internal pure returns (uint256) {
        if (b >= 0) {
            return a + uint256(b);
        } else {
            uint256 absB = uint256(-b);
            if (absB > a) revert MathOverflow();
            return a - absB;
        }
    }
}