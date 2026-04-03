// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../../contracts/core/LicenseNFT.sol";

contract LicenseNFTTest is Test {
    LicenseNFT public nft;
    address public artist = address(0x1);
    address public buyer = address(0x2);
    address public owner = address(this);

    string public constant TOKEN_URI = "ipfs://QmTest123456789";
    string public constant LICENSE_TYPE = "exclusive";

    function setUp() public {
        nft = new LicenseNFT();
    }

    function test_MintLicense() public {
        uint256 tokenId = nft.mintLicense(buyer, TOKEN_URI, artist, LICENSE_TYPE);

        assertEq(nft.ownerOf(tokenId), buyer);
        assertEq(nft.tokenURI(tokenId), TOKEN_URI);
    }

    function test_RoyaltyInfo() public {
        uint256 tokenId = nft.mintLicense(buyer, TOKEN_URI, artist, LICENSE_TYPE);
        uint256 salePrice = 1 ether;

        (address receiver, uint256 royaltyAmount) = nft.royaltyInfo(tokenId, salePrice);

        assertEq(receiver, artist);
        assertEq(royaltyAmount, 0.08 ether);
    }

    function testFuzz_RoyaltyCalculation(uint256 salePrice) public {
        salePrice = bound(salePrice, 1, 1000 ether);

        uint256 tokenId = nft.mintLicense(buyer, TOKEN_URI, artist, LICENSE_TYPE);
        (address receiver, uint256 royaltyAmount) = nft.royaltyInfo(tokenId, salePrice);

        assertEq(receiver, artist);
        assertEq(royaltyAmount, (salePrice * 800) / 10000);
        assertTrue(royaltyAmount <= salePrice);
    }

    function test_SetTokenRoyalty() public {
        uint256 tokenId = nft.mintLicense(buyer, TOKEN_URI, artist, LICENSE_TYPE);
        address newReceiver = address(0x3);
        uint96 newRoyaltyBps = 1000;

        nft.setTokenRoyalty(tokenId, newReceiver, newRoyaltyBps);

        (address receiver, uint256 royaltyAmount) = nft.royaltyInfo(tokenId, 1 ether);

        assertEq(receiver, newReceiver);
        assertEq(royaltyAmount, 0.1 ether);
    }

    function test_RevertWhen_InvalidRoyaltyPercentage() public {
        uint256 tokenId = nft.mintLicense(buyer, TOKEN_URI, artist, LICENSE_TYPE);

        vm.expectRevert(LicenseNFT.InvalidRoyaltyPercentage.selector);
        nft.setTokenRoyalty(tokenId, artist, 10001);
    }

    function test_SupportsERC2981Interface() public {
        assertTrue(nft.supportsInterface(type(IERC2981).interfaceId));
        assertTrue(nft.supportsInterface(type(IERC721).interfaceId));
    }
}
