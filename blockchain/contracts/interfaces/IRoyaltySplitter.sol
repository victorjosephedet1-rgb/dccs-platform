// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IRoyaltySplitter
 * @dev Interface for the V3BMusic.ai royalty splitting system
 */
interface IRoyaltySplitter {
    event RoyaltyDistributed(
        address indexed artist,
        address indexed platform,
        uint256 artistAmount,
        uint256 platformAmount,
        uint256 totalAmount
    );

    event ArtistShareUpdated(uint256 oldShare, uint256 newShare);

    function distributeRoyalty(address artist) external payable;

    function getArtistShare() external view returns (uint256);

    function getPlatformShare() external view returns (uint256);

    function getPlatformAddress() external view returns (address);
}
