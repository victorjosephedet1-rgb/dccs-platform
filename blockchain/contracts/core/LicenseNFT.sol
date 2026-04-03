// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "../interfaces/IERC2981.sol";

/**
 * @title LicenseNFT
 * @dev ERC-721 + ERC-2981 compliant license tokens for V3BMusic.ai
 * @notice Each NFT represents a music license with built-in royalty information
 */
contract LicenseNFT is ERC721, ERC721URIStorage, IERC2981, Ownable, ReentrancyGuard {
    uint256 private _tokenIdCounter;
    uint96 private constant DEFAULT_ROYALTY_BPS = 800;

    struct RoyaltyInfo {
        address receiver;
        uint96 royaltyFraction;
    }

    mapping(uint256 => RoyaltyInfo) private _tokenRoyalties;
    RoyaltyInfo private _defaultRoyalty;

    event LicenseMinted(
        uint256 indexed tokenId,
        address indexed artist,
        address indexed buyer,
        string licenseType
    );

    event RoyaltySet(uint256 indexed tokenId, address receiver, uint96 royaltyFraction);

    error InvalidRoyaltyPercentage();
    error InvalidAddress();

    constructor() ERC721("V3BMusic License", "V3BL") Ownable(msg.sender) {
        _defaultRoyalty = RoyaltyInfo(address(this), DEFAULT_ROYALTY_BPS);
    }

    /**
     * @notice Mints a new license NFT
     * @param to Address receiving the license
     * @param uri Metadata URI (IPFS/Arweave)
     * @param artist Artist address for royalties
     * @param licenseType Type of license being issued
     * @return tokenId The newly minted token ID
     */
    function mintLicense(
        address to,
        string calldata uri,
        address artist,
        string calldata licenseType
    ) external onlyOwner nonReentrant returns (uint256) {
        if (to == address(0) || artist == address(0)) revert InvalidAddress();

        uint256 tokenId = _tokenIdCounter++;

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);

        _tokenRoyalties[tokenId] = RoyaltyInfo(artist, DEFAULT_ROYALTY_BPS);

        emit LicenseMinted(tokenId, artist, to, licenseType);
        emit RoyaltySet(tokenId, artist, DEFAULT_ROYALTY_BPS);

        return tokenId;
    }

    /**
     * @notice Sets custom royalty for a specific token
     * @param tokenId Token ID to set royalty for
     * @param receiver Address receiving royalties
     * @param royaltyBps Royalty percentage in basis points (800 = 8%)
     */
    function setTokenRoyalty(
        uint256 tokenId,
        address receiver,
        uint96 royaltyBps
    ) external onlyOwner {
        if (receiver == address(0)) revert InvalidAddress();
        if (royaltyBps > 10000) revert InvalidRoyaltyPercentage();

        _tokenRoyalties[tokenId] = RoyaltyInfo(receiver, royaltyBps);

        emit RoyaltySet(tokenId, receiver, royaltyBps);
    }

    /**
     * @notice ERC-2981 royalty info implementation
     * @param tokenId Token ID being queried
     * @param salePrice Sale price of the token
     * @return receiver Address receiving royalties
     * @return royaltyAmount Royalty amount for the sale
     */
    function royaltyInfo(
        uint256 tokenId,
        uint256 salePrice
    ) external view override returns (address receiver, uint256 royaltyAmount) {
        RoyaltyInfo memory royalty = _tokenRoyalties[tokenId];

        if (royalty.receiver == address(0)) {
            royalty = _defaultRoyalty;
        }

        royaltyAmount = (salePrice * royalty.royaltyFraction) / 10000;
        return (royalty.receiver, royaltyAmount);
    }

    /**
     * @notice Checks if contract supports an interface
     * @param interfaceId Interface identifier
     * @return True if interface is supported
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, ERC721URIStorage, IERC165) returns (bool) {
        return
            interfaceId == type(IERC2981).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
}
