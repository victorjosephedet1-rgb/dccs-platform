// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../../contracts/core/RoyaltySplitter.sol";

contract RoyaltySplitterTest is Test {
    RoyaltySplitter public splitter;
    address public platform = address(0x1);
    address public artist = address(0x2);
    address public owner = address(this);

    event RoyaltyDistributed(
        address indexed artist,
        address indexed platform,
        uint256 artistAmount,
        uint256 platformAmount,
        uint256 totalAmount
    );

    function setUp() public {
        vm.deal(owner, 1000 ether);
        vm.deal(artist, 1 ether);
        splitter = new RoyaltySplitter(platform);
    }

    function test_Constructor() public {
        assertEq(splitter.getArtistShare(), 8000);
        assertEq(splitter.getPlatformShare(), 2000);
        assertEq(splitter.getPlatformAddress(), platform);
    }

    function test_DistributeRoyalty() public {
        uint256 paymentAmount = 1 ether;
        uint256 expectedArtistAmount = 0.8 ether;
        uint256 expectedPlatformAmount = 0.2 ether;

        uint256 artistBalanceBefore = artist.balance;
        uint256 platformBalanceBefore = platform.balance;

        vm.expectEmit(true, true, false, true);
        emit RoyaltyDistributed(
            artist,
            platform,
            expectedArtistAmount,
            expectedPlatformAmount,
            paymentAmount
        );

        splitter.distributeRoyalty{value: paymentAmount}(artist);

        assertEq(artist.balance, artistBalanceBefore + expectedArtistAmount);
        assertEq(platform.balance, platformBalanceBefore + expectedPlatformAmount);
    }

    function testFuzz_DistributeRoyalty(uint256 amount) public {
        vm.assume(amount > 0 && amount <= 1000 ether);

        uint256 expectedArtistAmount = (amount * 8000) / 10000;
        uint256 expectedPlatformAmount = amount - expectedArtistAmount;

        vm.deal(address(this), amount);

        uint256 artistBalanceBefore = artist.balance;
        uint256 platformBalanceBefore = platform.balance;

        splitter.distributeRoyalty{value: amount}(artist);

        assertEq(artist.balance, artistBalanceBefore + expectedArtistAmount);
        assertEq(platform.balance, platformBalanceBefore + expectedPlatformAmount);
        assertEq(
            artist.balance + platform.balance,
            artistBalanceBefore + platformBalanceBefore + amount
        );
    }

    function test_RevertWhen_ZeroArtistAddress() public {
        vm.expectRevert(RoyaltySplitter.InvalidAddress.selector);
        splitter.distributeRoyalty{value: 1 ether}(address(0));
    }

    function test_RevertWhen_ZeroAmount() public {
        vm.expectRevert(RoyaltySplitter.InsufficientAmount.selector);
        splitter.distributeRoyalty{value: 0}(artist);
    }

    function test_SetArtistShare() public {
        uint256 newShare = 9000;

        splitter.setArtistShare(newShare);

        assertEq(splitter.getArtistShare(), newShare);
        assertEq(splitter.getPlatformShare(), 1000);
    }

    function test_RevertWhen_InvalidShare() public {
        vm.expectRevert(RoyaltySplitter.InvalidShare.selector);
        splitter.setArtistShare(10001);
    }

    function test_RevertWhen_UnauthorizedSetShare() public {
        vm.prank(artist);
        vm.expectRevert();
        splitter.setArtistShare(9000);
    }

    function test_SetPlatformAddress() public {
        address newPlatform = address(0x3);

        splitter.setPlatformAddress(newPlatform);

        assertEq(splitter.getPlatformAddress(), newPlatform);
    }

    function test_RevertWhen_ZeroPlatformAddress() public {
        vm.expectRevert(RoyaltySplitter.InvalidAddress.selector);
        splitter.setPlatformAddress(address(0));
    }
}
