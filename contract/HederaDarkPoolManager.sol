// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

interface IDarkpoolPerpDEX {
    function owner() external view returns (address);
    function treasury() external view returns (address);
    function paused() external view returns (bool);
    function noirVerifierContract() external view returns (address);
    function priceOracleContract() external view returns (address);
    function setPaused(bool _paused) external;
    function getMarketSymbols() external view returns (string[] memory);
    function getBalance(address user) external view returns (uint256 available, uint256 locked);
    function deposit() external payable;
    function withdraw(uint256 amount) external;
}

/**
 * @title Hedera-Compatible DarkPool Manager
 * @dev Uses events and state variables instead of return values for Hedera compatibility
 * 
 * NETWORK: HEDERA PREVIEWNET (Chain ID 297)
 * DEPLOYED DARKPOOL: 0xC4D7B5729A9Dca7dfcaCd1BB435bba3d0B559617
 */
contract HederaDarkPoolManager {
    // Constants
    address public constant DARKPOOL_ADDRESS = address(0xC4D7B5729A9Dca7dfcaCd1BB435bba3d0B559617);
    IDarkpoolPerpDEX public immutable DARKPOOL;
    address public immutable manager;
    
    // State variables to store results (since view functions don't work reliably)
    address public lastCheckedOwner;
    address public lastCheckedTreasury;
    address public lastCheckedNoirVerifier;
    address public lastCheckedPriceOracle;
    bool public lastCheckedPaused;
    uint256 public lastCheckedBalance;
    bool public contractExists;
    uint256 public contractCodeSize;
    string[] public lastCheckedMarkets;
    uint256 public lastCheckedMarketCount;
    
    // User balance tracking
    mapping(address => uint256) public lastCheckedAvailable;
    mapping(address => uint256) public lastCheckedLocked;
    
    // Events for debugging and results
    event FundingSent(address indexed to, uint256 amount);
    event DepositMade(address indexed user, uint256 amount);
    event WithdrawalMade(address indexed user, uint256 amount);
    event DiagnosticResult(string action, bool success, address addr, uint256 value);
    event AddressChecked(string name, address addr);
    event SystemStatus(bool paused, uint256 balance, bool exists, uint256 marketCount);
    event UserBalanceChecked(address indexed user, uint256 available, uint256 locked);
    event MarketData(string[] markets);
    
    constructor() {
        manager = msg.sender;
        DARKPOOL = IDarkpoolPerpDEX(DARKPOOL_ADDRESS);
        emit AddressChecked("manager", manager);
        emit AddressChecked("darkpool", DARKPOOL_ADDRESS);
    }
    
    modifier onlyManager() {
        require(msg.sender == manager, "Not manager");
        _;
    }
    
    /**
     * @dev Check and store DarkPool addresses (updates state variables)
     */
    function checkDarkPoolAddresses() external {
        // Check if contract exists
        address target = DARKPOOL_ADDRESS;
        uint256 size;
        assembly {
            size := extcodesize(target)
        }
        contractCodeSize = size;
        contractExists = size > 0;
        
        emit DiagnosticResult("contractExists", contractExists, DARKPOOL_ADDRESS, size);
        
        if (!contractExists) {
            return;
        }
        
        // Try to get addresses with low-level calls
        (bool success1, bytes memory data1) = DARKPOOL_ADDRESS.staticcall(abi.encodeWithSignature("owner()"));
        if (success1 && data1.length >= 32) {
            lastCheckedOwner = abi.decode(data1, (address));
            emit AddressChecked("owner", lastCheckedOwner);
        }
        
        (bool success2, bytes memory data2) = DARKPOOL_ADDRESS.staticcall(abi.encodeWithSignature("treasury()"));
        if (success2 && data2.length >= 32) {
            lastCheckedTreasury = abi.decode(data2, (address));
            emit AddressChecked("treasury", lastCheckedTreasury);
        }
        
        (bool success3, bytes memory data3) = DARKPOOL_ADDRESS.staticcall(abi.encodeWithSignature("noirVerifierContract()"));
        if (success3 && data3.length >= 32) {
            lastCheckedNoirVerifier = abi.decode(data3, (address));
            emit AddressChecked("noirVerifier", lastCheckedNoirVerifier);
        }
        
        (bool success4, bytes memory data4) = DARKPOOL_ADDRESS.staticcall(abi.encodeWithSignature("priceOracleContract()"));
        if (success4 && data4.length >= 32) {
            lastCheckedPriceOracle = abi.decode(data4, (address));
            emit AddressChecked("priceOracle", lastCheckedPriceOracle);
        }
        
        (bool success5, bytes memory data5) = DARKPOOL_ADDRESS.staticcall(abi.encodeWithSignature("paused()"));
        if (success5 && data5.length >= 32) {
            lastCheckedPaused = abi.decode(data5, (bool));
        }
        
        // Try to get market symbols
        (bool success6, bytes memory data6) = DARKPOOL_ADDRESS.staticcall(abi.encodeWithSignature("getMarketSymbols()"));
        if (success6 && data6.length > 0) {
            try this.decodeStringArray(data6) returns (string[] memory markets) {
                delete lastCheckedMarkets; // Clear old data
                for (uint i = 0; i < markets.length; i++) {
                    lastCheckedMarkets.push(markets[i]);
                }
                lastCheckedMarketCount = markets.length;
                emit MarketData(markets);
            } catch {
                lastCheckedMarketCount = 0;
            }
        }
        
        lastCheckedBalance = DARKPOOL_ADDRESS.balance;
        
        emit SystemStatus(lastCheckedPaused, lastCheckedBalance, contractExists, lastCheckedMarketCount);
    }
    
    /**
     * @dev Helper function to decode string array (needs to be external for try/catch)
     */
    function decodeStringArray(bytes memory data) external pure returns (string[] memory) {
        return abi.decode(data, (string[]));
    }
    
    /**
     * @dev Check user balance and store results
     */
    function checkUserBalance(address user) external {
        require(user != address(0), "Invalid user address");
        
        (bool success, bytes memory data) = DARKPOOL_ADDRESS.staticcall(
            abi.encodeWithSignature("getBalance(address)", user)
        );
        
        if (success && data.length >= 64) {
            (uint256 available, uint256 locked) = abi.decode(data, (uint256, uint256));
            lastCheckedAvailable[user] = available;
            lastCheckedLocked[user] = locked;
            emit UserBalanceChecked(user, available, locked);
        }
    }
    
    /**
     * @dev Withdraw from DarkPool
     */
    function withdrawFromDarkpool(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        
        (bool success,) = DARKPOOL_ADDRESS.call(
            abi.encodeWithSignature("withdraw(uint256)", amount)
        );
        
        require(success, "Withdrawal failed");
        emit WithdrawalMade(msg.sender, amount);
    }
    
    /**
     * @dev Get stored market data
     */
    function getStoredMarkets() external view returns (string[] memory, uint256) {
        return (lastCheckedMarkets, lastCheckedMarketCount);
    }
    
    /**
     * @dev Get stored user balance
     */
    function getStoredUserBalance(address user) external view returns (uint256 available, uint256 locked) {
        return (lastCheckedAvailable[user], lastCheckedLocked[user]);
    }
    
    /**
     * @dev Get complete system summary
     */
    function getSystemSummary() external view returns (
        bool exists,
        uint256 codeSize,
        address owner,
        address treasury,
        bool paused,
        uint256 balance,
        uint256 marketCount
    ) {
        return (
            contractExists,
            contractCodeSize,
            lastCheckedOwner,
            lastCheckedTreasury,
            lastCheckedPaused,
            lastCheckedBalance,
            lastCheckedMarketCount
        );
    }

    /**
     * @dev Deposit to DarkPool with event logging
     */
    function depositToDarkpool() external payable {
        require(msg.value > 0, "No funds to deposit");
        
        // Check if contract exists first
        address target = DARKPOOL_ADDRESS;
        uint256 size;
        assembly {
            size := extcodesize(target)
        }
        
        require(size > 0, "DarkPool contract not found");
        
        // Try deposit
        (bool success,) = DARKPOOL_ADDRESS.call{value: msg.value}(
            abi.encodeWithSignature("deposit()")
        );
        
        require(success, "Deposit failed");
        emit DepositMade(msg.sender, msg.value);
    }
    
    /**
     * @dev Fund DarkPool directly
     */
    function fundDarkpool() external payable onlyManager {
        require(msg.value > 0, "No funds to send");
        
        (bool success,) = DARKPOOL_ADDRESS.call{value: msg.value}("");
        require(success, "Funding failed");
        
        emit FundingSent(DARKPOOL_ADDRESS, msg.value);
    }
    
    /**
     * @dev Emergency pause (if manager is owner)
     */
    function emergencyPause() external onlyManager {
        (bool success,) = DARKPOOL_ADDRESS.call(
            abi.encodeWithSignature("setPaused(bool)", true)
        );
        require(success, "Pause failed");
        
        emit DiagnosticResult("emergencyPause", success, DARKPOOL_ADDRESS, 0);
    }
    
    /**
     * @dev Resume operations (if manager is owner)
     */
    function resume() external onlyManager {
        (bool success,) = DARKPOOL_ADDRESS.call(
            abi.encodeWithSignature("setPaused(bool)", false)
        );
        require(success, "Resume failed");
        
        emit DiagnosticResult("resume", success, DARKPOOL_ADDRESS, 0);
    }
    
    /**
     * @dev Check basic network info
     */
    function checkNetworkInfo() external {
        uint256 chainId = block.chainid;
        uint256 blockNum = block.number;
        address sender = msg.sender;
        
        emit DiagnosticResult("chainId", true, address(0), chainId);
        emit DiagnosticResult("blockNumber", true, address(0), blockNum);
        emit AddressChecked("sender", sender);
    }
    
    /**
     * @dev Check the actual price oracle contract details
     */
    function checkPriceOracleDetails() external {
        address actualOracle = address(0xD2163E87d7fd20bc91e7B80D4D5AbcBad4Eb0888);
        
        // Check if the actual oracle exists
        uint256 size;
        assembly {
            size := extcodesize(actualOracle)
        }
        
        emit DiagnosticResult("actualOracleExists", size > 0, actualOracle, size);
        
        // Compare with what DarkPool reports
        emit AddressChecked("actualPriceOracle", actualOracle);
        emit AddressChecked("darkpoolReportedOracle", lastCheckedPriceOracle);
        
        // Check if DarkPool's oracle setting is correct
        bool oracleMatches = (lastCheckedPriceOracle == actualOracle);
        emit DiagnosticResult("oracleAddressMatches", oracleMatches, actualOracle, 0);
    }
    
    /**
     * @dev Withdraw accidental funds
     */
    function withdrawAccidentalFunds() external onlyManager {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success,) = manager.call{value: balance}("");
        require(success, "Withdrawal failed");
        
        emit DiagnosticResult("withdrawal", success, manager, balance);
    }
    
    // Fallback to accept HBAR
    receive() external payable {
        if (msg.value > 0) {
            (bool success,) = DARKPOOL_ADDRESS.call{value: msg.value}("");
            if (success) {
                emit FundingSent(DARKPOOL_ADDRESS, msg.value);
            }
        }
    }
}
