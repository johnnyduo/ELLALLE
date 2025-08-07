// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

interface INoirVerifier {
    function verifyProof(
        bytes calldata proof,
        bytes32[] calldata publicInputs
    ) external view returns (bool);
    
    function addValidProof(bytes32 proofHash) external;
    function isProofValid(bytes32 proofHash) external view returns (bool);
}