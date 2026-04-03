// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "../interfaces/IRoyaltySplitter.sol";

/**
 * @title InstantPayout
 * @dev Multi-chain instant cryptocurrency royalty payouts for V3BMusic.ai
 * @notice Enables immediate artist compensation in crypto
 */
contract InstantPayout is Ownable, ReentrancyGuard {
    IRoyaltySplitter public immutable royaltySplitter;

    struct PayoutRecord {
        address artist;
        uint256 amount;
        uint256 timestamp;
        bytes32 transactionHash;
    }

    mapping(address => PayoutRecord[]) private artistPayouts;
    mapping(address => uint256) private totalPayouts;

    event InstantPayoutExecuted(
        address indexed artist,
        uint256 amount,
        uint256 timestamp,
        bytes32 indexed transactionHash
    );

    event BatchPayoutExecuted(
        uint256 artistCount,
        uint256 totalAmount,
        uint256 timestamp
    );

    error InvalidAmount();
    error InvalidAddress();
    error PayoutFailed();
    error InsufficientBalance();

    /**
     * @notice Initializes instant payout system
     * @param _royaltySplitter Address of the RoyaltySplitter contract
     */
    constructor(address _royaltySplitter) Ownable(msg.sender) {
        if (_royaltySplitter == address(0)) revert InvalidAddress();
        royaltySplitter = IRoyaltySplitter(_royaltySplitter);
    }

    /**
     * @notice Executes instant payout to an artist
     * @param artist Artist address receiving payment
     * @dev Uses RoyaltySplitter for automatic 80/20 distribution
     */
    function executeInstantPayout(
        address artist
    ) external payable nonReentrant {
        if (artist == address(0)) revert InvalidAddress();
        if (msg.value == 0) revert InvalidAmount();

        bytes32 txHash = keccak256(
            abi.encodePacked(artist, msg.value, block.timestamp)
        );

        royaltySplitter.distributeRoyalty{value: msg.value}(artist);

        PayoutRecord memory record = PayoutRecord({
            artist: artist,
            amount: msg.value,
            timestamp: block.timestamp,
            transactionHash: txHash
        });

        artistPayouts[artist].push(record);
        totalPayouts[artist] += msg.value;

        emit InstantPayoutExecuted(artist, msg.value, block.timestamp, txHash);
    }

    /**
     * @notice Executes batch payouts to multiple artists
     * @param artists Array of artist addresses
     * @param amounts Array of payout amounts (must match artists length)
     */
    function executeBatchPayout(
        address[] calldata artists,
        uint256[] calldata amounts
    ) external payable onlyOwner nonReentrant {
        if (artists.length != amounts.length) revert InvalidAmount();
        if (artists.length == 0) revert InvalidAmount();

        uint256 totalRequired = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            totalRequired += amounts[i];
        }

        if (msg.value < totalRequired) revert InsufficientBalance();

        for (uint256 i = 0; i < artists.length; i++) {
            if (artists[i] == address(0)) revert InvalidAddress();
            if (amounts[i] == 0) revert InvalidAmount();

            bytes32 txHash = keccak256(
                abi.encodePacked(artists[i], amounts[i], block.timestamp, i)
            );

            royaltySplitter.distributeRoyalty{value: amounts[i]}(artists[i]);

            PayoutRecord memory record = PayoutRecord({
                artist: artists[i],
                amount: amounts[i],
                timestamp: block.timestamp,
                transactionHash: txHash
            });

            artistPayouts[artists[i]].push(record);
            totalPayouts[artists[i]] += amounts[i];

            emit InstantPayoutExecuted(
                artists[i],
                amounts[i],
                block.timestamp,
                txHash
            );
        }

        emit BatchPayoutExecuted(artists.length, totalRequired, block.timestamp);
    }

    /**
     * @notice Gets payout history for an artist
     * @param artist Artist address
     * @return Array of payout records
     */
    function getArtistPayouts(
        address artist
    ) external view returns (PayoutRecord[] memory) {
        return artistPayouts[artist];
    }

    /**
     * @notice Gets total payouts received by an artist
     * @param artist Artist address
     * @return Total amount paid to artist
     */
    function getTotalPayouts(address artist) external view returns (uint256) {
        return totalPayouts[artist];
    }

    /**
     * @notice Emergency withdrawal function
     * @dev Only owner can withdraw in case of emergency
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        if (balance == 0) revert InsufficientBalance();

        (bool success, ) = owner().call{value: balance}("");
        if (!success) revert PayoutFailed();
    }

    receive() external payable {}
}
