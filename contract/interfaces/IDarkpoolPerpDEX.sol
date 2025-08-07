// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

interface IDarkpoolPerpDEX {
    // Structs
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
    
    struct EncryptedOrder {
        bytes32 commitment;
        bytes32 nullifier;
        address trader;
        uint256 timestamp;
        bool isActive;
    }
    
    // Events
    event MarketCreated(string indexed symbol, uint256 maxLeverage);
    event OrderSubmitted(bytes32 indexed commitment, address indexed trader);
    event PositionOpened(bytes32 indexed positionId, address indexed trader, string market, bool isLong, uint256 size);
    event PositionClosed(bytes32 indexed positionId, address indexed trader, int256 pnl);
    event TradeExecuted(bytes32 indexed nullifier, address indexed trader, uint256 size);
    event Deposit(address indexed user, uint256 amount);
    event Withdrawal(address indexed user, uint256 amount);
    event Liquidation(bytes32 indexed positionId, address indexed liquidator, uint256 penalty);
    event FundingPaid(string indexed market, int256 fundingPayment);
    
    // Functions
    function deposit() external payable;
    function withdraw(uint256 amount) external;
    function submitEncryptedOrder(
        bytes32 commitment,
        bytes calldata proof,
        bytes32[] calldata publicInputs,
        string memory market,
        bool isBuy
    ) external;
    function openPosition(
        string memory market,
        bool isLong,
        uint256 size,
        uint256 leverage,
        bytes calldata proof
    ) external;
    function closePosition(bytes32 positionId) external;
    function liquidatePosition(bytes32 positionId) external;
    function updateFunding(string memory market) external;
}