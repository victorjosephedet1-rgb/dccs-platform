// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IDCCSRegistry.sol";

/**
 * @title DCCSRegistry
 * @dev Digital Clearance Code System - Immutable license tracking on blockchain
 * @notice Records and verifies music licenses using unique DCCS codes
 */
contract DCCSRegistry is IDCCSRegistry, Ownable {
    mapping(bytes32 => LicenseData) private licenses;
    mapping(address => bytes32[]) private artistLicenses;

    error LicenseAlreadyExists();
    error LicenseNotFound();
    error UnauthorizedAccess();
    error InvalidLicense();

    constructor() Ownable(msg.sender) {}

    /**
     * @notice Registers a new license with a unique DCCS code
     * @param dccsCode Unique digital clearance code
     * @param contentHash IPFS or content hash of the licensed work
     * @param licenseType Type of license (e.g., "exclusive", "non-exclusive")
     * @dev Only the artist can register their licenses
     */
    function registerLicense(
        bytes32 dccsCode,
        string calldata contentHash,
        string calldata licenseType
    ) external override {
        if (dccsCode == bytes32(0)) revert InvalidLicense();
        if (licenses[dccsCode].timestamp != 0) revert LicenseAlreadyExists();

        licenses[dccsCode] = LicenseData({
            artist: msg.sender,
            contentHash: contentHash,
            timestamp: block.timestamp,
            active: true,
            licenseType: licenseType
        });

        artistLicenses[msg.sender].push(dccsCode);

        emit LicenseRegistered(dccsCode, msg.sender, contentHash, licenseType);
    }

    /**
     * @notice Revokes an active license
     * @param dccsCode The DCCS code to revoke
     * @dev Only the license owner or contract owner can revoke
     */
    function revokeLicense(bytes32 dccsCode) external override {
        LicenseData storage license = licenses[dccsCode];

        if (license.timestamp == 0) revert LicenseNotFound();
        if (msg.sender != license.artist && msg.sender != owner()) {
            revert UnauthorizedAccess();
        }

        license.active = false;

        emit LicenseRevoked(dccsCode, msg.sender);
    }

    /**
     * @notice Transfers license ownership to a new address
     * @param dccsCode The DCCS code to transfer
     * @param newOwner New owner address
     * @dev Only current owner can transfer
     */
    function transferLicense(
        bytes32 dccsCode,
        address newOwner
    ) external override {
        if (newOwner == address(0)) revert InvalidLicense();

        LicenseData storage license = licenses[dccsCode];

        if (license.timestamp == 0) revert LicenseNotFound();
        if (msg.sender != license.artist) revert UnauthorizedAccess();

        address oldOwner = license.artist;
        license.artist = newOwner;

        artistLicenses[newOwner].push(dccsCode);

        emit LicenseTransferred(dccsCode, oldOwner, newOwner);
    }

    /**
     * @notice Verifies if a license is valid and active
     * @param dccsCode The DCCS code to verify
     * @return True if license exists and is active
     */
    function verifyLicense(
        bytes32 dccsCode
    ) external view override returns (bool) {
        LicenseData memory license = licenses[dccsCode];
        return license.timestamp != 0 && license.active;
    }

    /**
     * @notice Retrieves complete license data
     * @param dccsCode The DCCS code to query
     * @return Complete license information
     */
    function getLicenseData(
        bytes32 dccsCode
    ) external view override returns (LicenseData memory) {
        if (licenses[dccsCode].timestamp == 0) revert LicenseNotFound();
        return licenses[dccsCode];
    }

    /**
     * @notice Gets all licenses for an artist
     * @param artist Artist address
     * @return Array of DCCS codes owned by the artist
     */
    function getArtistLicenses(
        address artist
    ) external view returns (bytes32[] memory) {
        return artistLicenses[artist];
    }
}
