// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "../interfaces/IDarkpoolPerpDEX.sol";

abstract contract DarkpoolStorage {
    // Constants
    uint256 internal constant PRECISION = 1e18;
    uint256 internal constant MAX_LEVERAGE = 100;
    uint256 internal constant BASIS_POINTS = 10000;
    uint256 internal constant FUNDING_INTERVAL = 8 hours;
    uint256 internal constant LIQUIDATION_PENALTY = 250; // 2.5%
    uint256 internal constant MIN_POSITION_SIZE = 0.001 ether;
    
    // State variables
    address public owner;
    address public treasury;
    bool public paused;
    
    // Fee structure
    uint256 public makerFee = 10; // 0.1%
    uint256 public takerFee = 30; // 0.3%
    uint256 public liquidationFee = 100; // 1%
    
    // Core components addresses
    address public noirVerifier;
    address public priceOracle;
    
    // Markets
    mapping(string => IDarkpoolPerpDEX.Market) public markets;
    string[] public marketSymbols;
    
    // Positions
    mapping(bytes32 => IDarkpoolPerpDEX.Position) public positions;
    mapping(address => bytes32[]) public userPositions;
    mapping(address => mapping(string => uint256)) public userMarketExposure;
    
    // Darkpool orders
    mapping(bytes32 => IDarkpoolPerpDEX.EncryptedOrder) public encryptedOrders;
    mapping(bytes32 => bool) public usedNullifiers;
    mapping(bytes32 => bytes32) public commitmentToOrder;
    
    // Order book
    mapping(string => bytes32[]) public buyOrders;
    mapping(string => bytes32[]) public sellOrders;
    mapping(string => mapping(uint256 => bytes32[])) public limitOrders;
    
    // User balances
    mapping(address => uint256) public balances;
    mapping(address => uint256) public lockedBalances;
    
    // Protocol statistics
    uint256 public totalVolume;
    uint256 public totalFees;
    uint256 public totalLiquidations;
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    modifier whenNotPaused() {
        require(!paused, "Contract paused");
        _;
    }
}