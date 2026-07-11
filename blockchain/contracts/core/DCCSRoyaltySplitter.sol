// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title DCCSRoyaltySplitter
 * @author Victor360 Brand Limited
 * @dev Manages digital asset registration with immutable 80/20 programmatic royalty distribution.
 * @notice This contract secures the DCCS platform's core royalty distribution mechanism.
 * Creators receive 80% of all licensing revenue, platform receives 20% for operational costs.
 */

interface IERC721Receiver {
    function onERC721Received(address operator, address from, uint256 tokenId, bytes calldata data) external returns (bytes4);
}

contract DCCSRoyaltySplitter {
    string public constant name = "DCCS Verified Asset Registry";
    string public constant symbol = "DCCS-IP";

    address public immutable treasuryWallet;
    uint256 public totalAssets;

    struct AssetMetadata {
        string dccsHash;
        address creator;
        uint256 timestamp;
        bool isActive;
    }

    mapping(uint256 => AssetMetadata) private _assets;
    mapping(uint256 => address) private _owners;
    mapping(address => uint256) private _balances;
    mapping(string => bool) private _registeredHashes;

    event AssetRegistered(uint256 indexed assetId, address indexed creator, string dccsHash);
    event RoyaltyPaid(uint256 indexed assetId, address indexed creator, uint256 creatorShare, uint256 treasuryShare);
    event AssetDeactivated(uint256 indexed assetId, address indexed creator);

    modifier onlyAssetOwner(uint256 assetId) {
        require(_owners[assetId] == msg.sender, "DCCS: Caller is not the verified asset owner");
        _;
    }

    constructor(address _treasuryWallet) {
        require(_treasuryWallet != address(0), "DCCS: Invalid treasury address");
        treasuryWallet = _treasuryWallet;
    }

    /**
     * @dev Registers asset, mints ownership token, registers hardcoded 80/20 split rules.
     */
    function registerAsset(address to, string calldata dccsHash) external returns (uint256) {
        require(to != address(0), "DCCS: Cannot mint to zero address");
        require(!_registeredHashes[dccsHash], "DCCS: Asset hash already protected on-chain");
        require(bytes(dccsHash).length > 0, "DCCS: Invalid DCCS hash");

        totalAssets++;
        uint256 newAssetId = totalAssets;

        _owners[newAssetId] = to;
        _balances[to] += 1;
        _registeredHashes[dccsHash] = true;

        _assets[newAssetId] = AssetMetadata({
            dccsHash: dccsHash,
            creator: to,
            timestamp: block.timestamp,
            isActive: true
        });

        emit AssetRegistered(newAssetId, to, dccsHash);
        return newAssetId;
    }

    /**
     * @dev Processes incoming licensing payments, dispersing 80% to creator and 20% to treasury.
     */
    function distributeRoyalty(uint256 assetId) external payable {
        AssetMetadata storage asset = _assets[assetId];
        require(msg.value > 0, "DCCS: Payment must be greater than zero");
        require(asset.creator != address(0), "DCCS: Asset does not exist");

        if (asset.isActive) {
            uint256 treasuryShare = (msg.value * 20) / 100;
            uint256 creatorShare = msg.value - treasuryShare;

            (bool successCreator, ) = payable(asset.creator).call{value: creatorShare}("");
            require(successCreator, "DCCS: Creator royalty payment distribution failed");

            (bool successTreasury, ) = payable(treasuryWallet).call{value: treasuryShare}("");
            require(successTreasury, "DCCS: Treasury platform fee distribution failed");

            emit RoyaltyPaid(assetId, asset.creator, creatorShare, treasuryShare);
        } else {
            (bool successDirect, ) = payable(asset.creator).call{value: msg.value}("");
            require(successDirect, "DCCS: Direct off-platform payment routing failed");

            emit RoyaltyPaid(assetId, asset.creator, msg.value, 0);
        }
    }

    /**
     * @dev Creator can opt-out of the platform tracking layer, stopping the 20% commission cut.
     */
    function deactivateAssetTracking(uint256 assetId) external onlyAssetOwner(assetId) {
        AssetMetadata storage asset = _assets[assetId];
        require(asset.isActive, "DCCS: Tracking is already turned off");

        asset.isActive = false;
        emit AssetDeactivated(assetId, msg.sender);
    }

    function getAsset(uint256 assetId) external view returns (string memory dccsHash, address creator, uint256 timestamp, bool isActive) {
        AssetMetadata memory asset = _assets[assetId];
        return (asset.dccsHash, asset.creator, asset.timestamp, asset.isActive);
    }

    function ownerOf(uint256 tokenId) external view returns (address) {
        address owner = _owners[tokenId];
        require(owner != address(0), "DCCS: Owner query for nonexistent token");
        return owner;
    }

    function balanceOf(address owner) external view returns (uint256) {
        require(owner != address(0), "DCCS: Balance query for zero address");
        return _balances[owner];
    }

    function isHashRegistered(string calldata dccsHash) external view returns (bool) {
        return _registeredHashes[dccsHash];
    }

    receive() external payable {}
}
