// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "../storage/DarkpoolStorage.sol";
import "../libraries/MathLib.sol";

library PositionLib {
    using MathLib for uint256;
    
    // Import structs from DarkpoolStorage
    struct Position {
        bytes32 positionId;
        address trader;
        string market;
        bool isLong;
        uint256 size;
        uint256 collateral;
        uint256 entryPrice;
        uint256 leverage;
        int256 fundingIndex;
        uint256 timestamp;
        bool isOpen;
    }
    
    struct Market {
        string symbol;
        bytes32 pythPriceId;
        uint256 maintenanceMargin;
        uint256 initialMargin;
        uint256 maxLeverage;
        uint256 fundingRate;
        uint256 lastFundingTime;
        int256 cumulativeFunding;
        uint256 openInterestLong;
        uint256 openInterestShort;
        bool isActive;
    }
    
    event PositionOpened(bytes32 indexed positionId, address indexed trader, string market, bool isLong, uint256 size);
    event PositionClosed(bytes32 indexed positionId, address indexed trader, int256 pnl);
    event Liquidation(bytes32 indexed positionId, address indexed liquidator, uint256 penalty);
    
    uint256 constant PRECISION = 1e18;
    
    function calculatePnL(
        Position memory position,
        uint256 exitPrice
    ) internal pure returns (int256) {
        int256 priceDiff;
        if (position.isLong) {
            priceDiff = int256(exitPrice) - int256(position.entryPrice);
        } else {
            priceDiff = int256(position.entryPrice) - int256(exitPrice);
        }
        
        return (priceDiff * int256(position.size)) / int256(position.entryPrice);
    }
    
    function calculateFunding(
        Position memory position,
        mapping(string => Market) storage markets
    ) internal view returns (int256) {
        Market memory mkt = markets[position.market];
        int256 fundingDelta = mkt.cumulativeFunding - position.fundingIndex;
        
        if (position.isLong) {
            return (fundingDelta * int256(position.size)) / int256(PRECISION);
        } else {
            return -(fundingDelta * int256(position.size)) / int256(PRECISION);
        }
    }
    
    function calculateNetPnL(
        Position memory position,
        uint256 exitPrice,
        mapping(string => Market) storage markets
    ) internal view returns (int256) {
        int256 pnl = calculatePnL(position, exitPrice);
        int256 funding = calculateFunding(position, markets);
        return pnl - funding;
    }
    
    function isLiquidatable(
        Position memory position,
        uint256 currentPrice,
        Market memory mkt
    ) internal pure returns (bool) {
        int256 pnl = calculatePnL(position, currentPrice);
        
        if (pnl < 0) {
            uint256 loss = MathLib.abs(pnl);
            uint256 maintenanceRequired = position.size.percentageOf(mkt.maintenanceMargin);
            return (position.collateral <= loss + maintenanceRequired);
        }
        
        return false;
    }
    
    function processPositionClosure(
        Position memory position,
        int256 netPnl,
        uint256 takerFee,
        address treasury,
        mapping(address => uint256) storage balances
    ) internal returns (uint256) {
        uint256 closingFee = position.size.percentageOf(takerFee);
        uint256 returnAmount = position.collateral;
        
        // Apply PnL
        if (netPnl > 0) {
            returnAmount = returnAmount.addSigned(netPnl);
        } else {
            uint256 loss = MathLib.abs(netPnl);
            if (loss >= position.collateral) {
                returnAmount = 0;
            } else {
                returnAmount -= loss;
            }
        }
        
        // Deduct closing fee
        if (returnAmount > closingFee) {
            returnAmount -= closingFee;
            balances[treasury] += closingFee;
        } else {
            balances[treasury] += returnAmount;
            returnAmount = 0;
        }
        
        return returnAmount;
    }
}
