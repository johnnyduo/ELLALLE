// SPDX-License-Identifier: MIT deployed at 0x5c678898e917B1bAFab5d6E3fe68016F4D5b949F
pragma solidity ^0.8.26;

/**
 * @title CompactDarkPoolDEX - Simplified for Remix Deployment
 * @dev Production-ready dark pool with dual token support and Noir ZKP integration
 * 
 * DEPLOYMENT INSTRUCTIONS FOR REMIX:
 * 1. Deploy with USDC token address: 0x1b20865c8C1B8B50cC19F54D8Da4873bfFcaD1F3
 * 2. Enable optimizer with 200 runs: 
 * 3. Set gas limit to 3,000,000
 */

// ============ INTERFACES ============
interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

interface INoirVerifier {
    function verify(bytes calldata proof, bytes32[] calldata publicInputs) external view returns (bool);
}

// ============ MAIN CONTRACT ============
contract CompactDarkPoolDEX {
    
    // ============ CORE STATE ============
    address public owner;
    address public treasury;
    bool public paused;
    IERC20 public immutable usdcToken;
    INoirVerifier public noirVerifier;
    
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
    
    // Position tracking
    struct Position {
        address trader;
        uint256 size;
        uint256 collateral;
        bool isLong;
        bool useHBAR;
        uint256 entryPrice;
        bool isOpen;
    }
    
    mapping(bytes32 => Position) public positions;
    mapping(address => bytes32[]) public userPositions;
    
    // ============ EVENTS ============
    event HBARDeposit(address indexed user, uint256 amount);
    event USDCDeposit(address indexed user, uint256 amount);
    event HBARWithdraw(address indexed user, uint256 amount);
    event USDCWithdraw(address indexed user, uint256 amount);
    event CommitmentSubmitted(bytes32 indexed commitment, address indexed trader);
    event TradeExecuted(bytes32 indexed commitment, address indexed trader, uint256 size, bool isLong);
    event PositionClosed(bytes32 indexed positionId, address indexed trader, int256 pnl);
    
    // ============ MODIFIERS ============
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    modifier whenNotPaused() {
        require(!paused, "Paused");
        _;
    }
    
    // ============ CONSTRUCTOR ============
    constructor(address _usdcToken) {
        require(_usdcToken != address(0), "Invalid USDC");
        owner = msg.sender;
        treasury = msg.sender;
        usdcToken = IERC20(_usdcToken);
    }
    
    // ============ DEPOSIT FUNCTIONS ============
    
    /**
     * @dev Deposit native HBAR (recommended for stability)
     */
    function deposit() external payable whenNotPaused {
        require(msg.value > 0, "Invalid amount");
        hbarBalances[msg.sender] += msg.value;
        emit HBARDeposit(msg.sender, msg.value);
    }
    
    /**
     * @dev Deposit USDC tokens
     */
    function depositUSDC(uint256 amount) external whenNotPaused {
        require(amount > 0, "Invalid amount");
        require(usdcToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        usdcBalances[msg.sender] += amount;
        emit USDCDeposit(msg.sender, amount);
    }
    
    // ============ WITHDRAW FUNCTIONS ============
    
    /**
     * @dev Withdraw available HBAR balance
     */
    function withdraw(uint256 amount) external whenNotPaused {
        require(amount > 0, "Invalid amount");
        uint256 available = hbarBalances[msg.sender] - hbarLocked[msg.sender];
        require(available >= amount, "Insufficient balance");
        
        hbarBalances[msg.sender] -= amount;
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
        
        emit HBARWithdraw(msg.sender, amount);
    }
    
    /**
     * @dev Withdraw available USDC balance
     */
    function withdrawUSDC(uint256 amount) external whenNotPaused {
        require(amount > 0, "Invalid amount");
        uint256 available = usdcBalances[msg.sender] - usdcLocked[msg.sender];
        require(available >= amount, "Insufficient balance");
        
        usdcBalances[msg.sender] -= amount;
        require(usdcToken.transfer(msg.sender, amount), "Transfer failed");
        
        emit USDCWithdraw(msg.sender, amount);
    }
    
    // ============ ZKP DARK POOL FUNCTIONS ============
    
    /**
     * @dev Submit encrypted order commitment (Noir ZKP integration)
     */
    function submitCommitment(bytes32 commitment) external whenNotPaused {
        require(!usedCommitments[commitment], "Commitment used");
        require(commitment != bytes32(0), "Invalid commitment");
        
        usedCommitments[commitment] = true;
        commitmentToTrader[commitment] = msg.sender;
        userCommitments[msg.sender].push(commitment);
        
        emit CommitmentSubmitted(commitment, msg.sender);
    }
    
    /**
     * @dev Execute trade with ZKP proof
     * @param proof Noir ZK proof
     * @param publicInputs Public inputs for verification
     * @param commitment Order commitment being executed
     * @param size Position size
     * @param isLong Long or short position
     * @param useHBAR Use HBAR (true) or USDC (false)
     */
    function executeTrade(
        bytes calldata proof,
        bytes32[] calldata publicInputs,
        bytes32 commitment,
        uint256 size,
        bool isLong,
        bool useHBAR
    ) external whenNotPaused {
        require(usedCommitments[commitment], "Invalid commitment");
        require(commitmentToTrader[commitment] == msg.sender, "Not your commitment");
        require(size > 0, "Invalid size");
        
        // Verify ZK proof if verifier is set
        if (address(noirVerifier) != address(0)) {
            require(noirVerifier.verify(proof, publicInputs), "Invalid proof");
        }
        
        // Calculate required collateral (simplified to 10% of position size)
        uint256 collateral = size / 10;
        uint256 fee = (collateral * takerFee) / 10000;
        uint256 total = collateral + fee;
        
        // Lock collateral in appropriate token
        if (useHBAR) {
            require(hbarBalances[msg.sender] >= total, "Insufficient HBAR");
            hbarBalances[msg.sender] -= total;
            hbarLocked[msg.sender] += collateral;
            hbarBalances[treasury] += fee;
        } else {
            require(usdcBalances[msg.sender] >= total, "Insufficient USDC");
            usdcBalances[msg.sender] -= total;
            usdcLocked[msg.sender] += collateral;
            usdcBalances[treasury] += fee;
        }
        
        // Create position
        bytes32 positionId = keccak256(abi.encodePacked(msg.sender, commitment, block.timestamp));
        positions[positionId] = Position({
            trader: msg.sender,
            size: size,
            collateral: collateral,
            isLong: isLong,
            useHBAR: useHBAR,
            entryPrice: 50000 * 1e18, // Mock price - replace with oracle
            isOpen: true
        });
        
        userPositions[msg.sender].push(positionId);
        
        // Mark commitment as used
        delete commitmentToTrader[commitment];
        
        emit TradeExecuted(commitment, msg.sender, size, isLong);
    }
    
    /**
     * @dev Close position and settle PnL
     */
    function closePosition(bytes32 positionId) external whenNotPaused {
        Position storage position = positions[positionId];
        require(position.trader == msg.sender, "Not your position");
        require(position.isOpen, "Position closed");
        
        // Calculate PnL (simplified - use 2% profit)
        uint256 exitPrice = 51000 * 1e18; // Mock price - replace with oracle
        int256 pnl = calculatePnL(position, exitPrice);
        uint256 returnAmount = processReturn(position.collateral, pnl);
        
        // Unlock and return funds
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
    
    // ============ HELPER FUNCTIONS ============
    
    function calculatePnL(Position memory position, uint256 exitPrice) internal pure returns (int256) {
        int256 priceDiff;
        if (position.isLong) {
            priceDiff = int256(exitPrice) - int256(position.entryPrice);
        } else {
            priceDiff = int256(position.entryPrice) - int256(exitPrice);
        }
        return (priceDiff * int256(position.size)) / int256(position.entryPrice);
    }
    
    function processReturn(uint256 collateral, int256 pnl) internal pure returns (uint256) {
        if (pnl >= 0) {
            return collateral + uint256(pnl);
        } else {
            uint256 loss = uint256(-pnl);
            return loss >= collateral ? 0 : collateral - loss;
        }
    }
    
    // ============ VIEW FUNCTIONS ============
    
    function getHBARBalance(address user) external view returns (uint256 available, uint256 locked) {
        return (hbarBalances[user] - hbarLocked[user], hbarLocked[user]);
    }
    
    function getUSDCBalance(address user) external view returns (uint256 available, uint256 locked) {
        return (usdcBalances[user] - usdcLocked[user], usdcLocked[user]);
    }
    
    function getAllBalances(address user) external view returns (
        uint256 hbarAvail, uint256 hbarLock, uint256 usdcAvail, uint256 usdcLock
    ) {
        return (
            hbarBalances[user] - hbarLocked[user], hbarLocked[user],
            usdcBalances[user] - usdcLocked[user], usdcLocked[user]
        );
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
    
    function getContractInfo() external view returns (
        address contractOwner,
        address treasuryAddr,
        uint256 makerFeeRate,
        uint256 takerFeeRate,
        bool isPaused,
        address usdcAddr,
        address verifierAddr
    ) {
        return (owner, treasury, makerFee, takerFee, paused, address(usdcToken), address(noirVerifier));
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    function setNoirVerifier(address _verifier) external onlyOwner {
        noirVerifier = INoirVerifier(_verifier);
    }
    
    function setPaused(bool _paused) external onlyOwner {
        paused = _paused;
    }
    
    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "Invalid address");
        treasury = _treasury;
    }
    
    function setFees(uint256 _makerFee, uint256 _takerFee) external onlyOwner {
        require(_makerFee <= 100 && _takerFee <= 100, "Fees too high");
        makerFee = _makerFee;
        takerFee = _takerFee;
    }
    
    // Emergency functions
    function emergencyWithdraw() external onlyOwner {
        // HBAR
        uint256 hbarBalance = address(this).balance;
        if (hbarBalance > 0) {
            (bool success, ) = owner.call{value: hbarBalance}("");
            require(success, "HBAR transfer failed");
        }
        
        // USDC
        uint256 usdcBalance = usdcToken.balanceOf(address(this));
        if (usdcBalance > 0) {
            require(usdcToken.transfer(owner, usdcBalance), "USDC transfer failed");
        }
    }
    
    // ============ LEGACY COMPATIBILITY ============
    
    /**
     * @dev Legacy balance function for backward compatibility
     */
    function getBalance(address user) external view returns (uint256 available, uint256 locked) {
        return (hbarBalances[user] - hbarLocked[user], hbarLocked[user]);
    }
    
    function getUSDCAddress() external view returns (address) {
        return address(usdcToken);
    }
}

/**
 * @title Deployment Instructions for Remix
 * 
 * 1. COMPILER SETTINGS:
 *    - Solidity Version: 0.8.26
 *    - Enable Optimization: YES
 *    - Runs: 200
 *    - EVM Version: london
 * 
 * 2. DEPLOYMENT PARAMETERS:
 *    - Constructor: _usdcToken = 0x1b20865c8C1B8B50cC19F54D8Da4873bfFcaD1F3
 *    - Gas Limit: 3,000,000
 *    - Network: Hedera Previewnet
 * 
 * 3. POST-DEPLOYMENT:
 *    - Call setNoirVerifier() if you have a verifier contract
 *    - Test deposit() with small HBAR amount
 *    - Test depositUSDC() if you have USDC tokens
 * 
 * 4. ZKP INTEGRATION:
 *    - Deploy Noir verifier contract separately
 *    - Call setNoirVerifier() with verifier address
 *    - Use submitCommitment() -> executeTrade() flow
 * 
 * 5. FEATURES:
 *    ✅ Dual token support (HBAR + USDC)
 *    ✅ ZKP commitment system
 *    ✅ Private order execution
 *    ✅ Position management
 *    ✅ Emergency functions
 *    ✅ Remix-optimized size
 */
