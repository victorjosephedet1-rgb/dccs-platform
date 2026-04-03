// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IDCCSRegistry
 * @dev Interface for Digital Clearance Code System (DCCS) Registry
 */
interface IDCCSRegistry {
    struct LicenseData {
        address artist;
        string contentHash;
        uint256 timestamp;
        bool active;
        string licenseType;
    }

    event LicenseRegistered(
        bytes32 indexed dccsCode,
        address indexed artist,
        string contentHash,
        string licenseType
    );

    event LicenseRevoked(bytes32 indexed dccsCode, address indexed revoker);

    event LicenseTransferred(
        bytes32 indexed dccsCode,
        address indexed from,
        address indexed to
    );

    function registerLicense(
        bytes32 dccsCode,
        string calldata contentHash,
        string calldata licenseType
    ) external;

    function revokeLicense(bytes32 dccsCode) external;

    function transferLicense(bytes32 dccsCode, address newOwner) external;

    function verifyLicense(bytes32 dccsCode) external view returns (bool);

    function getLicenseData(
        bytes32 dccsCode
    ) external view returns (LicenseData memory);
}
