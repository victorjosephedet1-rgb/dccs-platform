// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../../contracts/core/DCCSRegistry.sol";

contract DCCSRegistryTest is Test {
    DCCSRegistry public registry;
    address public artist = address(0x1);
    address public buyer = address(0x2);

    bytes32 public constant TEST_DCCS = keccak256("TEST_LICENSE_001");
    string public constant CONTENT_HASH = "QmTest123456789";
    string public constant LICENSE_TYPE = "exclusive";

    event LicenseRegistered(
        bytes32 indexed dccsCode,
        address indexed artist,
        string contentHash,
        string licenseType
    );

    function setUp() public {
        registry = new DCCSRegistry();
    }

    function test_RegisterLicense() public {
        vm.prank(artist);
        vm.expectEmit(true, true, false, true);
        emit LicenseRegistered(TEST_DCCS, artist, CONTENT_HASH, LICENSE_TYPE);

        registry.registerLicense(TEST_DCCS, CONTENT_HASH, LICENSE_TYPE);

        assertTrue(registry.verifyLicense(TEST_DCCS));

        IDCCSRegistry.LicenseData memory license = registry.getLicenseData(TEST_DCCS);
        assertEq(license.artist, artist);
        assertEq(license.contentHash, CONTENT_HASH);
        assertEq(license.licenseType, LICENSE_TYPE);
        assertTrue(license.active);
    }

    function test_RevertWhen_DuplicateLicense() public {
        vm.startPrank(artist);
        registry.registerLicense(TEST_DCCS, CONTENT_HASH, LICENSE_TYPE);

        vm.expectRevert(DCCSRegistry.LicenseAlreadyExists.selector);
        registry.registerLicense(TEST_DCCS, CONTENT_HASH, LICENSE_TYPE);
        vm.stopPrank();
    }

    function test_RevertWhen_InvalidDCCSCode() public {
        vm.prank(artist);
        vm.expectRevert(DCCSRegistry.InvalidLicense.selector);
        registry.registerLicense(bytes32(0), CONTENT_HASH, LICENSE_TYPE);
    }

    function test_RevokeLicense() public {
        vm.prank(artist);
        registry.registerLicense(TEST_DCCS, CONTENT_HASH, LICENSE_TYPE);

        vm.prank(artist);
        registry.revokeLicense(TEST_DCCS);

        assertFalse(registry.verifyLicense(TEST_DCCS));
    }

    function test_OwnerCanRevokeLicense() public {
        vm.prank(artist);
        registry.registerLicense(TEST_DCCS, CONTENT_HASH, LICENSE_TYPE);

        vm.prank(address(this));
        registry.revokeLicense(TEST_DCCS);

        assertFalse(registry.verifyLicense(TEST_DCCS));
    }

    function test_RevertWhen_UnauthorizedRevoke() public {
        vm.prank(artist);
        registry.registerLicense(TEST_DCCS, CONTENT_HASH, LICENSE_TYPE);

        vm.prank(buyer);
        vm.expectRevert(DCCSRegistry.UnauthorizedAccess.selector);
        registry.revokeLicense(TEST_DCCS);
    }

    function test_TransferLicense() public {
        vm.prank(artist);
        registry.registerLicense(TEST_DCCS, CONTENT_HASH, LICENSE_TYPE);

        vm.prank(artist);
        registry.transferLicense(TEST_DCCS, buyer);

        IDCCSRegistry.LicenseData memory license = registry.getLicenseData(TEST_DCCS);
        assertEq(license.artist, buyer);
    }

    function test_RevertWhen_UnauthorizedTransfer() public {
        vm.prank(artist);
        registry.registerLicense(TEST_DCCS, CONTENT_HASH, LICENSE_TYPE);

        vm.prank(buyer);
        vm.expectRevert(DCCSRegistry.UnauthorizedAccess.selector);
        registry.transferLicense(TEST_DCCS, buyer);
    }

    function testFuzz_RegisterMultipleLicenses(uint256 count) public {
        count = bound(count, 1, 100);

        for (uint256 i = 0; i < count; i++) {
            bytes32 dccsCode = keccak256(abi.encodePacked("LICENSE", i));

            vm.prank(artist);
            registry.registerLicense(dccsCode, CONTENT_HASH, LICENSE_TYPE);

            assertTrue(registry.verifyLicense(dccsCode));
        }

        bytes32[] memory artistLicenses = registry.getArtistLicenses(artist);
        assertEq(artistLicenses.length, count);
    }
}
