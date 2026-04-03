// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

/**
 * @title IERC2981
 * @dev Interface for the NFT Royalty Standard
 */
interface IERC2981 is IERC165 {
    /**
     * @notice Called with the sale price to determine how much royalty is owed and to whom.
     * @param tokenId The NFT asset queried for royalty information
     * @param salePrice The sale price of the NFT asset specified by tokenId
     * @return receiver Address that should receive the royalty payment
     * @return royaltyAmount The royalty payment amount for salePrice
     */
    function royaltyInfo(
        uint256 tokenId,
        uint256 salePrice
    ) external view returns (address receiver, uint256 royaltyAmount);
}
