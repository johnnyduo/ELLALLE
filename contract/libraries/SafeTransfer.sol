// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

library SafeTransfer {
    error TransferFailed();
    error InsufficientBalance();
    
    function safeTransferETH(address to, uint256 amount) internal {
        if (address(this).balance < amount) revert InsufficientBalance();
        
        (bool success, ) = to.call{value: amount}("");
        if (!success) revert TransferFailed();
    }
    
    function safeTransferFrom(
        address token,
        address from,
        address to,
        uint256 amount
    ) internal {
        (bool success, bytes memory data) = token.call(
            abi.encodeWithSelector(0x23b872dd, from, to, amount)
        );
        
        if (!success || (data.length != 0 && !abi.decode(data, (bool)))) {
            revert TransferFailed();
        }
    }
}