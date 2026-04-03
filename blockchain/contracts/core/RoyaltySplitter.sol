// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "../interfaces/IRoyaltySplitter.sol";

/**
 * @title RoyaltySplitter
 * @dev Automated royalty distribution system for V3BMusic.ai
 * @notice Implements 80/20 split: 80% to artists, 20% to platform
 */
contract RoyaltySplitter is IRoyaltySplitter, Ownable, ReentrancyGuard {
    uint256 public constant BASIS_POINTS = 10000;
    uint256 private artistShareBps;
    address private platformAddress;

    error InvalidShare();
    error InvalidAddress();
    error TransferFailed();
    error InsufficientAmount();

    /**
     * @notice Initializes the royalty splitter with 80/20 split
     * @param _platformAddress Address that receives platform fees
     */
    constructor(address _platformAddress) Ownable(msg.sender) {
        if (_platformAddress == address(0)) revert InvalidAddress();

        artistShareBps = 8000;
        platformAddress = _platformAddress;
    }

    /**
     * @notice Distributes royalty payment to artist and platform
     * @param artist Address of the artist receiving royalties
     * @dev Automatically splits payment: 80% to artist, 20% to platform
     */
    function distributeRoyalty(
        address artist
    ) external payable override nonReentrant {
        if (artist == address(0)) revert InvalidAddress();
        if (msg.value == 0) revert InsufficientAmount();

        uint256 artistAmount = (msg.value * artistShareBps) / BASIS_POINTS;
        uint256 platformAmount = msg.value - artistAmount;

        (bool artistSuccess, ) = artist.call{value: artistAmount}("");
        if (!artistSuccess) revert TransferFailed();

        (bool platformSuccess, ) = platformAddress.call{value: platformAmount}("");
        if (!platformSuccess) revert TransferFailed();

        emit RoyaltyDistributed(
            artist,
            platformAddress,
            artistAmount,
            platformAmount,
            msg.value
        );
    }

    /**
     * @notice Updates the artist share percentage
     * @param newShareBps New artist share in basis points (8000 = 80%)
     * @dev Only owner can update. Must be <= 10000 basis points
     */
    function setArtistShare(uint256 newShareBps) external onlyOwner {
        if (newShareBps > BASIS_POINTS) revert InvalidShare();

        uint256 oldShare = artistShareBps;
        artistShareBps = newShareBps;

        emit ArtistShareUpdated(oldShare, newShareBps);
    }

    /**
     * @notice Updates the platform address
     * @param newPlatformAddress New platform address
     * @dev Only owner can update
     */
    function setPlatformAddress(address newPlatformAddress) external onlyOwner {
        if (newPlatformAddress == address(0)) revert InvalidAddress();
        platformAddress = newPlatformAddress;
    }

    /**
     * @notice Gets the current artist share percentage
     * @return Artist share in basis points
     */
    function getArtistShare() external view override returns (uint256) {
        return artistShareBps;
    }

    /**
     * @notice Gets the current platform share percentage
     * @return Platform share in basis points
     */
    function getPlatformShare() external view override returns (uint256) {
        return BASIS_POINTS - artistShareBps;
    }

    /**
     * @notice Gets the platform address
     * @return Platform address
     */
    function getPlatformAddress() external view override returns (address) {
        return platformAddress;
    }

    receive() external payable {}
}
