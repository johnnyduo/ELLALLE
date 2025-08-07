// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "../interfaces/IDarkpoolPerpDEX.sol";
import "../interfaces/INoirVerifier.sol";
import "../storage/DarkpoolStorage.sol";
import "../libraries/MathLib.sol";
import "../libraries/SafeTransfer.sol";
import "../oracle/PythPriceConsumer.sol";
import "../zkp/NoirVerifier.sol";

contract DarkpoolPerpDEX is IDarkpoolPerpDEX, DarkpoolStorage {
    using MathLib for uint256;
    using SafeTransfer for address;
    
    // Contracts
    NoirVerifier public immutable noirVerifierContract;
    PythPriceConsumer public immutable priceOracleContract;
    
    constructor() {
        owner = msg.sender;
        treasury = msg.sender;
        
        // Deploy sub-contracts
        noirVerifierContract = new NoirVerifier();
        priceOracleContract = new PythPriceConsumer(address(0)); // Mock for testnet
        
        noirVerifier = address(noirVerifierContract);
        priceOracle = address(priceOracleContract);
        
        // Initialize markets
        _initializeMarkets();
    }
    
    // ============ INITIALIZATION ============
    
    function _initializeMarkets() private {
        _createMarket("BTC/USD", 50, 100, 100, 10);
        _createMarket("ETH/USD", 50, 100, 100, 10);
        _createMarket("SOL/USD", 75, 150, 50, 15);
        _createMarket("HBAR/USD", 100, 200, 25, 20);
        _createMarket("ADA/USD", 100, 200, 25, 20);
        _createMarket("AVAX/USD", 75, 150, 50, 15);
        _createMarket("DOT/USD", 100, 200, 25, 20);
        _createMarket("MATIC/USD", 100, 200, 25, 20);
    }
    
    function _createMarket(
        string memory symbol,
        uint256 maintenanceMargin,
        uint256 initialMargin,
        uint256 maxLeverage,
        uint256 fundingRate
    ) private {
        markets[symbol] = Market({
            symbol: symbol,
            pythPriceId: priceOracleContract.priceIds(symbol),
            maintenanceMargin: maintenanceMargin,
            initialMargin: initialMargin,
            maxLeverage: maxLeverage,
            fundingRate: fundingRate,
            lastFundingTime: block.timestamp,
            cumulativeFunding: 0,
            openInterestLong: 0,
            openInterestShort: 0,
            isActive: true
        });
        
        marketSymbols.push(symbol);
        emit MarketCreated(symbol, maxLeverage);
    }
    
    // ============ USER FUNCTIONS ============
    
    function deposit() external payable override whenNotPaused {
        require(msg.value > 0, "Invalid amount");
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }
    
    function withdraw(uint256 amount) external override whenNotPaused {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        require(lockedBalances[msg.sender] == 0, "Balance locked");
        
        balances[msg.sender] -= amount;
        SafeTransfer.safeTransferETH(msg.sender, amount);
        
        emit Withdrawal(msg.sender, amount);
    }
    
    // ============ DARKPOOL ORDERS ============
    
    function submitEncryptedOrder(
        bytes32 commitment,
        bytes calldata proof,
        bytes32[] calldata publicInputs,
        string memory market,
        bool isBuy
    ) external override whenNotPaused {
        require(markets[market].isActive, "Market inactive");
        
        // Verify ZK proof
        require(
            noirVerifierContract.verifyProof(proof, publicInputs),
            "Invalid proof"
        );
        
        // Generate and check nullifier
        bytes32 nullifier = keccak256(abi.encodePacked(commitment, msg.sender, block.timestamp));
        require(!usedNullifiers[nullifier], "Nullifier used");
        
        // Create encrypted order
        EncryptedOrder memory order = EncryptedOrder({
            commitment: commitment,
            nullifier: nullifier,
            trader: msg.sender,
            timestamp: block.timestamp,
            isActive: true
        });
        
        encryptedOrders[commitment] = order;
        commitmentToOrder[commitment] = nullifier;
        
        // Add to order book
        if (isBuy) {
            buyOrders[market].push(commitment);
        } else {
            sellOrders[market].push(commitment);
        }
        
        emit OrderSubmitted(commitment, msg.sender);
    }
    
    // ============ PERPETUAL TRADING ============
    
    function openPosition(
        string memory market,
        bool isLong,
        uint256 size,
        uint256 leverage,
        bytes calldata /* proof */
    ) external override whenNotPaused {
        bytes32 positionId = _validateAndCreatePosition(market, isLong, size, leverage);
        _updatePositionState(positionId, market, isLong, size);
        
        emit PositionOpened(positionId, msg.sender, market, isLong, size);
    }
    
    function _validateAndCreatePosition(
        string memory market,
        bool isLong,
        uint256 size,
        uint256 leverage
    ) private returns (bytes32) {
        Market storage mkt = markets[market];
        require(mkt.isActive, "Market inactive");
        require(leverage > 0 && leverage <= mkt.maxLeverage, "Invalid leverage");
        require(size >= MIN_POSITION_SIZE, "Size too small");
        
        // Calculate costs
        uint256 collateralRequired = size.mulDiv(BASIS_POINTS, leverage * 100);
        uint256 fee = collateralRequired.percentageOf(takerFee);
        uint256 totalRequired = collateralRequired + fee;
        require(totalRequired >= collateralRequired, "Overflow");
        require(balances[msg.sender] >= totalRequired, "Insufficient balance");
        
        // Get price and create position ID
        (int64 price,) = priceOracleContract.getLatestPrice(market);
        require(price > 0, "Invalid price");
        
        bytes32 positionId = keccak256(
            abi.encodePacked(msg.sender, market, block.timestamp, block.prevrandao)
        );
        
        // Create and store position
        positions[positionId] = Position({
            positionId: positionId,
            trader: msg.sender,
            market: market,
            isLong: isLong,
            size: size,
            collateral: collateralRequired,
            entryPrice: uint256(int256(price)),
            leverage: leverage,
            fundingIndex: mkt.cumulativeFunding,
            timestamp: block.timestamp,
            isOpen: true
        });
        
        // Update balances
        userPositions[msg.sender].push(positionId);
        balances[msg.sender] -= totalRequired;
        lockedBalances[msg.sender] += collateralRequired;
        totalFees += fee;
        balances[treasury] += fee;
        
        return positionId;
    }
    
    function _updatePositionState(
        bytes32 /* positionId */,
        string memory market,
        bool isLong,
        uint256 size
    ) private {
        Market storage mkt = markets[market];
        
        // Update market stats
        if (isLong) {
            mkt.openInterestLong += size;
        } else {
            mkt.openInterestShort += size;
        }
        
        // Update volume
        totalVolume += size;
    }
    
    function closePosition(bytes32 positionId) external override whenNotPaused {
        Position storage position = positions[positionId];
        require(position.trader == msg.sender, "Not position owner");
        require(position.isOpen, "Position closed");
        
        // Get current price
        (int64 currentPrice,) = priceOracleContract.getLatestPrice(position.market);
        require(currentPrice > 0, "Invalid price");
        
        int256 netPnl = _calculateNetPnL(position, uint256(int256(currentPrice)));
        uint256 returnAmount = _processPositionClosure(position, netPnl);
        
        // Update state
        position.isOpen = false;
        balances[msg.sender] += returnAmount;
        lockedBalances[msg.sender] -= position.collateral;
        
        _updateMarketOnClose(position);
        
        emit PositionClosed(positionId, msg.sender, netPnl);
    }
    
    function _calculateNetPnL(Position memory position, uint256 exitPrice) private view returns (int256) {
        int256 pnl = _calculatePnL(position, exitPrice);
        int256 funding = _calculateFunding(position);
        return pnl - funding;
    }
    
    function _processPositionClosure(Position memory position, int256 netPnl) private returns (uint256) {
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
            totalFees += closingFee;
            balances[treasury] += closingFee;
        } else {
            totalFees += returnAmount;
            balances[treasury] += returnAmount;
            returnAmount = 0;
        }
        
        return returnAmount;
    }
    
    function _updateMarketOnClose(Position memory position) private {
        Market storage mkt = markets[position.market];
        if (position.isLong) {
            mkt.openInterestLong -= position.size;
        } else {
            mkt.openInterestShort -= position.size;
        }
        totalVolume += position.size;
    }
    
    // ============ LIQUIDATION ============
    
    function liquidatePosition(bytes32 positionId) external override whenNotPaused {
        Position storage position = positions[positionId];
        require(position.isOpen, "Position closed");
        
        // Get current price
        (int64 currentPrice,) = priceOracleContract.getLatestPrice(position.market);
        require(currentPrice > 0, "Invalid price");
        uint256 price = uint256(int256(currentPrice));
        
        // Check if liquidatable
        Market storage mkt = markets[position.market];
        require(_isLiquidatable(position, price, mkt), "Not liquidatable");
        
        // Calculate liquidation penalty
        uint256 penalty = position.collateral.percentageOf(LIQUIDATION_PENALTY);
        uint256 liquidatorReward = penalty / 2;
        
        // Update state
        position.isOpen = false;
        lockedBalances[position.trader] -= position.collateral;
        
        // Reward liquidator
        balances[msg.sender] += liquidatorReward;
        balances[treasury] += (penalty - liquidatorReward);
        
        // Update market stats
        if (position.isLong) {
            mkt.openInterestLong -= position.size;
        } else {
            mkt.openInterestShort -= position.size;
        }
        
        // Update stats
        totalLiquidations++;
        totalFees += penalty;
        
        emit Liquidation(positionId, msg.sender, penalty);
    }
    
    // ============ FUNDING RATE ============
    
    function updateFunding(string memory market) external override {
        Market storage mkt = markets[market];
        require(mkt.isActive, "Market inactive");
        
        uint256 timeDelta = block.timestamp - mkt.lastFundingTime;
        if (timeDelta >= FUNDING_INTERVAL) {
            // Calculate funding based on open interest imbalance
            int256 imbalance = int256(mkt.openInterestLong) - int256(mkt.openInterestShort);
            int256 fundingPayment = (imbalance * int256(mkt.fundingRate)) / int256(BASIS_POINTS);
            
            mkt.cumulativeFunding += fundingPayment;
            mkt.lastFundingTime = block.timestamp;
            
            emit FundingPaid(market, fundingPayment);
        }
    }
    
    // ============ INTERNAL FUNCTIONS ============
    
    function _calculatePnL(
        Position memory position,
        uint256 exitPrice
    ) private pure returns (int256) {
        int256 priceDiff;
        if (position.isLong) {
            priceDiff = int256(exitPrice) - int256(position.entryPrice);
        } else {
            priceDiff = int256(position.entryPrice) - int256(exitPrice);
        }
        
        return (priceDiff * int256(position.size)) / int256(position.entryPrice);
    }
    
    function _calculateFunding(Position memory position) private view returns (int256) {
        Market memory mkt = markets[position.market];
        int256 fundingDelta = mkt.cumulativeFunding - position.fundingIndex;
        
        if (position.isLong) {
            return (fundingDelta * int256(position.size)) / int256(PRECISION);
        } else {
            return -(fundingDelta * int256(position.size)) / int256(PRECISION);
        }
    }
    
    function _isLiquidatable(
        Position memory position,
        uint256 currentPrice,
        Market memory mkt
    ) private pure returns (bool) {
        int256 pnl = _calculatePnL(position, currentPrice);
        
        if (pnl < 0) {
            uint256 loss = MathLib.abs(pnl);
            uint256 maintenanceRequired = position.size.percentageOf(mkt.maintenanceMargin);
            return (position.collateral <= loss + maintenanceRequired);
        }
        
        return false;
    }
    
    // ============ VIEW FUNCTIONS ============
    
    function getPosition(bytes32 positionId) external view returns (Position memory) {
        return positions[positionId];
    }
    
    function getUserPositions(address user) external view returns (bytes32[] memory) {
        return userPositions[user];
    }
    
    function getMarket(string memory symbol) external view returns (Market memory) {
        return markets[symbol];
    }
    
    function getBalance(address user) external view returns (uint256 available, uint256 locked) {
        return (balances[user], lockedBalances[user]);
    }
    
    function getMarketSymbols() external view returns (string[] memory) {
        return marketSymbols;
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    function setPaused(bool _paused) external onlyOwner {
        paused = _paused;
    }
    
    function setFees(uint256 _makerFee, uint256 _takerFee) external onlyOwner {
        require(_makerFee <= 100 && _takerFee <= 100, "Fee too high");
        makerFee = _makerFee;
        takerFee = _takerFee;
    }
    
    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "Invalid treasury");
        treasury = _treasury;
    }
    
    function emergencyWithdraw() external onlyOwner {
        SafeTransfer.safeTransferETH(owner, address(this).balance);
    }
    
    // Receive function
    receive() external payable {}
}