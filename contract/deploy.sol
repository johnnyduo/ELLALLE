// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "./core/DarkpoolPerpDEX.sol";

/**
 * @title Direct Deploy Script for Remix IDE
 * @dev Direct deployment - no helper contracts needed
 * 
 * USAGE:
 * 1. Deploy this contract
 * 2. Call deploy()
 * 3. Call fund() with HBAR
 * 
 * COMPILER SETTINGS REQUIRED:
 * - Enable Optimizer: ✅
 * - Runs: 200
 * - Enable Via IR: ✅
 */
contract DirectDeploy {
    DarkpoolPerpDEX public darkpool;
    address public immutable deployer;
    bool public isDeployed;
    
    event Deployed(address indexed darkpool, address indexed deployer);
    
    constructor() {
        deployer = msg.sender;
    }
    
    /**
     * @dev Deploy the main contract directly
     */
    function deploy() external returns (address) {
        require(msg.sender == deployer, "Not deployer");
        require(!isDeployed, "Already deployed");
        
        darkpool = new DarkpoolPerpDEX();
        isDeployed = true;
        
        emit Deployed(address(darkpool), deployer);
        return address(darkpool);
    }
    
    /**
     * @dev Get all contract addresses
     */
    function getAddresses() external view returns (
        bool deployed,
        address darkpoolAddr,
        address noirVerifier,
        address priceOracle,
        address owner,
        address treasury
    ) {
        if (!isDeployed) return (false, address(0), address(0), address(0), address(0), address(0));
        
        return (
            true,
            address(darkpool),
            address(darkpool.noirVerifierContract()),
            address(darkpool.priceOracleContract()),
            darkpool.owner(),
            darkpool.treasury()
        );
    }
    
    /**
     * @dev Fund the darkpool
     */
    function fund() external payable {
        require(msg.sender == deployer, "Not deployer");
        require(isDeployed && msg.value > 0, "Invalid");
        
        (bool success,) = address(darkpool).call{value: msg.value}("");
        require(success, "Funding failed");
    }
    
    /**
     * @dev Get available markets
     */
    function getMarkets() external view returns (string[] memory) {
        require(isDeployed, "Not deployed");
        return darkpool.getMarketSymbols();
    }
    
    /**
     * @dev Emergency controls
     */
    function pause() external {
        require(msg.sender == deployer && isDeployed, "Invalid");
        darkpool.setPaused(true);
    }
    
    function unpause() external {
        require(msg.sender == deployer && isDeployed, "Invalid");
        darkpool.setPaused(false);
    }
    
    /**
     * @dev Health check
     */
    function healthCheck() external view returns (
        bool contractDeployed,
        bool systemActive,
        uint256 totalMarkets,
        uint256 contractBalance
    ) {
        if (!isDeployed) return (false, false, 0, 0);
        
        return (
            true,
            !darkpool.paused(),
            darkpool.getMarketSymbols().length,
            address(darkpool).balance
        );
    }
}
