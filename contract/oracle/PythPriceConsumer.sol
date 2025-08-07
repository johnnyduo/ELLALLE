// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "../interfaces/IPythOracle.sol";

contract PythPriceConsumer {
    IPythOracle public pythOracle;
    
    mapping(string => bytes32) public priceIds;
    mapping(bytes32 => uint256) public lastUpdateTime;
    
    uint256 public constant VALID_TIME_PERIOD = 60; // 60 seconds
    uint256 public constant PRICE_PRECISION = 1e8;
    
    address public owner;
    bool public useMockPrices = true; // For testnet
    
    // Events
    event PriceUpdated(string indexed symbol, int64 price, uint64 timestamp);
    event PriceIdSet(string indexed symbol, bytes32 indexed priceId);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    constructor(address _pythOracle) {
        owner = msg.sender;
        
        if (_pythOracle != address(0)) {
            pythOracle = IPythOracle(_pythOracle);
            useMockPrices = false;
        }
        
        _initializePriceIds();
    }
    
    /**
     * @dev Initialize price IDs for major pairs
     */
    function _initializePriceIds() private {
        // Mainnet Pyth Price IDs
        priceIds["BTC/USD"] = 0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43;
        priceIds["ETH/USD"] = 0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace;
        priceIds["SOL/USD"] = 0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d;
        priceIds["HBAR/USD"] = 0x3728e591097635310e6341af53db8b7ee42da9b3a8d918f9463ce9cca886dfbd;
        priceIds["ADA/USD"] = 0x2a01deaec9e51a579277b34b122399984d0bbf57e2458a7e42fecd2829867a0d;
        priceIds["AVAX/USD"] = 0x93da3352f9f1d105fdfe4971cfa80e9dd777bfc5d0f683ebb6e1294b92137bb7;
        priceIds["DOT/USD"] = 0xca3eed9b267293f6595901c734c7525ce8ef49adafe8284606ceb307afa2ca5b;
        priceIds["MATIC/USD"] = 0x5de33a9112c2b700b8d30b8a3402c103578ccfa2765696471cc672bd5cf6ac52;
        
        // Emit events
        emit PriceIdSet("BTC/USD", priceIds["BTC/USD"]);
        emit PriceIdSet("ETH/USD", priceIds["ETH/USD"]);
        emit PriceIdSet("SOL/USD", priceIds["SOL/USD"]);
    }
    
    /**
     * @dev Get latest price from Pyth or mock
     */
    function getLatestPrice(string memory symbol) external view returns (int64, uint64) {
        if (useMockPrices) {
            return _getMockPrice(symbol);
        }
        
        bytes32 priceId = priceIds[symbol];
        require(priceId != bytes32(0), "Price ID not set");
        
        IPythOracle.Price memory price = pythOracle.getPriceNoOlderThan(
            priceId,
            VALID_TIME_PERIOD
        );
        
        return (price.price, price.conf);
    }
    
    /**
     * @dev Get mock prices for testing
     */
    function _getMockPrice(string memory symbol) private view returns (int64, uint64) {
        bytes32 symbolHash = keccak256(bytes(symbol));
        
        if (symbolHash == keccak256(bytes("BTC/USD"))) {
            return (11459600000, uint64(block.timestamp));
        } else if (symbolHash == keccak256(bytes("ETH/USD"))) {
            return (366569000, uint64(block.timestamp));
        } else if (symbolHash == keccak256(bytes("SOL/USD"))) {
            return (16722000, uint64(block.timestamp));
        } else if (symbolHash == keccak256(bytes("HBAR/USD"))) {
            return (24253900, uint64(block.timestamp));
        } else if (symbolHash == keccak256(bytes("ADA/USD"))) {
            return (73626000, uint64(block.timestamp));
        } else if (symbolHash == keccak256(bytes("AVAX/USD"))) {
            return (2206000, uint64(block.timestamp));
        } else if (symbolHash == keccak256(bytes("DOT/USD"))) {
            return (366000, uint64(block.timestamp));
        } else if (symbolHash == keccak256(bytes("MATIC/USD"))) {
            return (23071000, uint64(block.timestamp));
        }
        
        return (100000000, uint64(block.timestamp)); // Default $1.00
    }
    
    /**
     * @dev Update price feeds
     */
    function updatePriceFeeds(bytes[] calldata priceUpdateData) external payable {
        if (!useMockPrices && address(pythOracle) != address(0)) {
            uint256 fee = pythOracle.getUpdateFee(priceUpdateData);
            pythOracle.updatePriceFeeds{value: fee}(priceUpdateData);
        }
        
        emit PriceUpdated("BTC/USD", 11459600000, uint64(block.timestamp));
    }
    
    /**
     * @dev Set custom price ID for a symbol
     */
    function setPriceId(string memory symbol, bytes32 priceId) external onlyOwner {
        priceIds[symbol] = priceId;
        emit PriceIdSet(symbol, priceId);
    }
    
    /**
     * @dev Toggle mock prices
     */
    function setUseMockPrices(bool _useMock) external onlyOwner {
        useMockPrices = _useMock;
    }
}