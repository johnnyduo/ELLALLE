// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/**
 * @title Enhanced CompactDarkPoolDEX with ZKP Trading Pairs
 * @dev Dark pool with multiple trading pairs and Zero-Knowledge Proof integration
 */

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

interface INoirVerifier {
    function verify(bytes calldata proof, bytes32[] calldata publicInputs) external view returns (bool);
}

contract EnhancedDarkPoolDEX {
    
    // ============ CORE STATE ============
    address public owner;
    address public treasury;
    bool public paused;
    IERC20 public immutable usdcToken;
    INoirVerifier public noirVerifier;
    
    // Trading pairs enum
    enum TradingPair { 
        HBAR_USD,   // 0
        BTC_USD,    // 1  
        ETH_USD,    // 2
        SOL_USD     // 3
    }
    
    // Pair configuration
    struct PairConfig {
        bool enabled;
        uint256 currentPrice;
        uint256 lastUpdate;
        uint256 minTradeSize;
        uint256 maxTradeSize;
    }
    
    mapping(uint8 => PairConfig) public pairConfigs;
    
    // Fees in basis points (1 basis point = 0.01%)
    uint256 public makerFee = 10;  // 0.1%
    uint256 public takerFee = 20;  // 0.2%
    
    // Dual token balances
    mapping(address => uint256) public hbarBalances;
    mapping(address => uint256) public usdcBalances;
    mapping(address => uint256) public hbarLocked;
    mapping(address => uint256) public usdcLocked;
    
    // ZKP commitment tracking
    mapping(bytes32 => bool) public usedCommitments;
    mapping(bytes32 => address) public commitmentToTrader;
    mapping(address => bytes32[]) public userCommitments;
    
    // Enhanced position tracking with pair info
    struct Position {
        address trader;
        uint8 pairId;           // Which trading pair
        uint256 size;           // Position size in base units
        uint256 collateral;     // Locked collateral
        bool isLong;            // Long or short
        bool useHBAR;           // Use HBAR or USDC as collateral
        uint256 entryPrice;     // Entry price
        uint256 timestamp;      // When position was opened
        bool isOpen;            // Position status
    }
    
    mapping(bytes32 => Position) public positions;
    mapping(address => bytes32[]) public userPositions;
    
    // ZKP trade parameters
    struct ZKPTradeParams {
        uint8 pairId;
        uint256 size;
        bool isLong;
        bool useHBAR;
        bytes32 commitment;
    }
    
    // ============ EVENTS ============
    event PairConfigured(uint8 indexed pairId, bool enabled, uint256 price);
    event CommitmentSubmitted(bytes32 indexed commitment, address indexed trader);
    event ZKPTradeExecuted(
        bytes32 indexed commitment, 
        address indexed trader, 
        uint8 pairId,
        bytes32 positionId
    );
    event PositionClosed(bytes32 indexed positionId, address indexed trader, int256 pnl);
    event PriceUpdated(uint8 indexed pairId, uint256 newPrice, uint256 timestamp);
    
    // ============ MODIFIERS ============
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    modifier whenNotPaused() {
        require(!paused, "Paused");
        _;
    }
    
    modifier validPair(uint8 pairId) {
        require(pairId <= 3, "Invalid pair");
        require(pairConfigs[pairId].enabled, "Pair disabled");
        _;
    }
    
    // ============ CONSTRUCTOR ============
    constructor(address _usdcToken, address _noirVerifier) {
        require(_usdcToken != address(0), "Invalid USDC");
        owner = msg.sender;
        treasury = msg.sender;
        usdcToken = IERC20(_usdcToken);
        noirVerifier = INoirVerifier(_noirVerifier);
        
        // Initialize trading pairs with default configs
        _initializePairs();
    }
    
    function _initializePairs() internal {
        // HBAR/USD
        pairConfigs[0] = PairConfig({
            enabled: true,
            currentPrice: 8420, // $0.0842 with 4 decimals
            lastUpdate: block.timestamp,
            minTradeSize: 1e6,   // 1 USDC minimum
            maxTradeSize: 10000e6 // 10,000 USDC maximum
        });
        
        // BTC/USD  
        pairConfigs[1] = PairConfig({
            enabled: true,
            currentPrice: 4325075, // $43,250.75 with 2 decimals
            lastUpdate: block.timestamp,
            minTradeSize: 1e6,
            maxTradeSize: 10000e6
        });
        
        // ETH/USD
        pairConfigs[2] = PairConfig({
            enabled: true,
            currentPrice: 234580, // $2,345.80 with 2 decimals
            lastUpdate: block.timestamp,
            minTradeSize: 1e6,
            maxTradeSize: 10000e6
        });
        
        // SOL/USD
        pairConfigs[3] = PairConfig({
            enabled: true,
            currentPrice: 9845, // $98.45 with 2 decimals
            lastUpdate: block.timestamp,
            minTradeSize: 1e6,
            maxTradeSize: 10000e6
        });
    }
    
    // ============ EXISTING DEPOSIT/WITHDRAW FUNCTIONS ============
    // (Keep all existing deposit/withdraw functions unchanged)
    
    function deposit() external payable whenNotPaused {
        require(msg.value > 0, "Invalid amount");
        hbarBalances[msg.sender] += msg.value;
        emit HBARDeposit(msg.sender, msg.value);
    }
    
    function depositUSDC(uint256 amount) external whenNotPaused {
        require(amount > 0, "Invalid amount");
        require(usdcToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        usdcBalances[msg.sender] += amount;
        emit USDCDeposit(msg.sender, amount);
    }
    
    function withdraw(uint256 amount) external whenNotPaused {
        require(amount > 0, "Invalid amount");
        require(hbarBalances[msg.sender] >= amount, "Insufficient balance");
        hbarBalances[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
        emit HBARWithdraw(msg.sender, amount);
    }
    
    function withdrawUSDC(uint256 amount) external whenNotPaused {
        require(amount > 0, "Invalid amount");
        require(usdcBalances[msg.sender] >= amount, "Insufficient balance");
        usdcBalances[msg.sender] -= amount;
        require(usdcToken.transfer(msg.sender, amount), "Transfer failed");
        emit USDCWithdraw(msg.sender, amount);
    }
    
    // ============ ZKP TRADING FUNCTIONS ============
    
    /**
     * @dev Submit a commitment for future ZKP trade
     */
    function submitCommitment(bytes32 commitment) external whenNotPaused {
        require(!usedCommitments[commitment], "Commitment already used");
        require(commitment != bytes32(0), "Invalid commitment");
        
        usedCommitments[commitment] = true;
        commitmentToTrader[commitment] = msg.sender;
        userCommitments[msg.sender].push(commitment);
        
        emit CommitmentSubmitted(commitment, msg.sender);
    }
    
    /**
     * @dev Execute ZKP trade with proof verification
     */
    function executeZKPTrade(
        bytes calldata proof,
        bytes32[] calldata publicInputs,
        ZKPTradeParams calldata params
    ) external whenNotPaused validPair(params.pairId) {
        // Verify commitment belongs to sender
        require(commitmentToTrader[params.commitment] == msg.sender, "Invalid commitment owner");
        require(usedCommitments[params.commitment], "Commitment not found");
        
        // Verify ZK proof
        require(noirVerifier.verify(proof, publicInputs), "Invalid proof");
        
        // Validate trade parameters
        PairConfig memory pairConfig = pairConfigs[params.pairId];
        require(params.size >= pairConfig.minTradeSize, "Size too small");
        require(params.size <= pairConfig.maxTradeSize, "Size too large");
        
        // Check collateral availability
        if (params.useHBAR) {
            require(hbarBalances[msg.sender] >= params.size, "Insufficient HBAR");
            hbarBalances[msg.sender] -= params.size;
            hbarLocked[msg.sender] += params.size;
        } else {
            require(usdcBalances[msg.sender] >= params.size, "Insufficient USDC");
            usdcBalances[msg.sender] -= params.size;
            usdcLocked[msg.sender] += params.size;
        }
        
        // Create position
        bytes32 positionId = keccak256(abi.encodePacked(
            msg.sender, 
            params.commitment, 
            block.timestamp,
            block.number
        ));
        
        positions[positionId] = Position({
            trader: msg.sender,
            pairId: params.pairId,
            size: params.size,
            collateral: params.size, // 1:1 for simplicity
            isLong: params.isLong,
            useHBAR: params.useHBAR,
            entryPrice: pairConfig.currentPrice,
            timestamp: block.timestamp,
            isOpen: true
        });
        
        userPositions[msg.sender].push(positionId);
        
        // Mark commitment as used for this trade
        delete usedCommitments[params.commitment];
        
        emit ZKPTradeExecuted(params.commitment, msg.sender, params.pairId, positionId);
    }
    
    /**
     * @dev Close a position and settle PnL
     */
    function closePosition(bytes32 positionId) external whenNotPaused {
        Position storage position = positions[positionId];
        require(position.trader == msg.sender, "Not your position");
        require(position.isOpen, "Position already closed");
        
        // Calculate PnL
        uint256 currentPrice = pairConfigs[position.pairId].currentPrice;
        int256 pnl = calculatePnL(position, currentPrice);
        
        // Process return amount
        uint256 returnAmount = processReturn(position.collateral, pnl);
        
        // Return collateral + PnL
        if (position.useHBAR) {
            hbarLocked[msg.sender] -= position.collateral;
            hbarBalances[msg.sender] += returnAmount;
        } else {
            usdcLocked[msg.sender] -= position.collateral;
            usdcBalances[msg.sender] += returnAmount;
        }
        
        position.isOpen = false;
        
        emit PositionClosed(positionId, msg.sender, pnl);
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Update price for a trading pair (owner only)
     */
    function updatePairPrice(uint8 pairId, uint256 newPrice) external onlyOwner validPair(pairId) {
        require(newPrice > 0, "Invalid price");
        
        pairConfigs[pairId].currentPrice = newPrice;
        pairConfigs[pairId].lastUpdate = block.timestamp;
        
        emit PriceUpdated(pairId, newPrice, block.timestamp);
    }
    
    /**
     * @dev Configure trading pair
     */
    function configurePair(
        uint8 pairId,
        bool enabled,
        uint256 minTradeSize,
        uint256 maxTradeSize
    ) external onlyOwner {
        require(pairId <= 3, "Invalid pair");
        
        pairConfigs[pairId].enabled = enabled;
        pairConfigs[pairId].minTradeSize = minTradeSize;
        pairConfigs[pairId].maxTradeSize = maxTradeSize;
        
        emit PairConfigured(pairId, enabled, pairConfigs[pairId].currentPrice);
    }
    
    // ============ VIEW FUNCTIONS ============
    
    function getHBARBalance(address user) external view returns (uint256 available, uint256 locked) {
        return (hbarBalances[user], hbarLocked[user]);
    }
    
    function getUSDCBalance(address user) external view returns (uint256 available, uint256 locked) {
        return (usdcBalances[user], usdcLocked[user]);
    }
    
    function getPairConfig(uint8 pairId) external view returns (PairConfig memory) {
        return pairConfigs[pairId];
    }
    
    function getPosition(bytes32 positionId) external view returns (Position memory) {
        return positions[positionId];
    }
    
    function getUserPositions(address user) external view returns (bytes32[] memory) {
        return userPositions[user];
    }
    
    function getUserCommitments(address user) external view returns (bytes32[] memory) {
        return userCommitments[user];
    }
    
    // ============ HELPER FUNCTIONS ============
    
    function calculatePnL(Position memory position, uint256 exitPrice) internal pure returns (int256) {
        if (position.isLong) {
            return int256(exitPrice) - int256(position.entryPrice);
        } else {
            return int256(position.entryPrice) - int256(exitPrice);
        }
    }
    
    function processReturn(uint256 collateral, int256 pnl) internal pure returns (uint256) {
        if (pnl >= 0) {
            return collateral + uint256(pnl);
        } else {
            uint256 loss = uint256(-pnl);
            return loss >= collateral ? 0 : collateral - loss;
        }
    }
    
    // ============ EVENTS FOR EXISTING FUNCTIONS ============
    event HBARDeposit(address indexed user, uint256 amount);
    event USDCDeposit(address indexed user, uint256 amount);
    event HBARWithdraw(address indexed user, uint256 amount);
    event USDCWithdraw(address indexed user, uint256 amount);
}
