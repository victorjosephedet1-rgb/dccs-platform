// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../../../contracts/core/RoyaltySplitter.sol";

contract RoyaltySplitterHandler is Test {
    RoyaltySplitter public splitter;
    address public artist;
    uint256 public totalDistributed;

    constructor(RoyaltySplitter _splitter, address _artist) {
        splitter = _splitter;
        artist = _artist;
    }

    function distributeRoyalty(uint256 amount) public {
        amount = bound(amount, 1, 100 ether);

        vm.deal(address(this), amount);
        splitter.distributeRoyalty{value: amount}(artist);
        totalDistributed += amount;
    }

    receive() external payable {}
}

contract RoyaltySplitterInvariantTest is Test {
    RoyaltySplitter public splitter;
    RoyaltySplitterHandler public handler;

    address public platform = address(0x1);
    address public artist = address(0x2);

    function setUp() public {
        vm.deal(address(this), 10000 ether);

        splitter = new RoyaltySplitter(platform);
        handler = new RoyaltySplitterHandler(splitter, artist);

        targetContract(address(handler));
    }

    function invariant_TotalSharesEqual100Percent() public {
        uint256 artistShare = splitter.getArtistShare();
        uint256 platformShare = splitter.getPlatformShare();

        assertEq(artistShare + platformShare, 10000, "Total shares must equal 100%");
    }

    function invariant_ArtistAlwaysGets80Percent() public {
        assertEq(splitter.getArtistShare(), 8000, "Artist must always get 80%");
    }

    function invariant_PlatformAlwaysGets20Percent() public {
        assertEq(splitter.getPlatformShare(), 2000, "Platform must always get 20%");
    }

    function invariant_NoFundsStuckInContract() public {
        assertEq(
            address(splitter).balance,
            0,
            "Contract should never hold funds after distribution"
        );
    }

    function invariant_DistributionMaintainsBalance() public {
        uint256 totalDistributed = handler.totalDistributed();
        uint256 artistBalance = artist.balance;
        uint256 platformBalance = platform.balance;

        assertEq(
            artistBalance + platformBalance,
            totalDistributed,
            "All distributed funds must be accounted for"
        );
    }
}
