import { ethers } from "ethers";
import { getNetworkConfig } from "../../shared/constants/networks";

const DCCS_ROYALTY_SPLITTER_ABI = [
  "function registerAsset(address to, string calldata dccsHash) external returns (uint256)",
  "function distributeRoyalty(uint256 assetId) external payable",
  "function getAsset(uint256 assetId) external view returns (string dccsHash, address creator, uint256 timestamp, bool isActive)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function balanceOf(address owner) external view returns (uint256)",
  "function deactivateAssetTracking(uint256 assetId) external",
  "function isHashRegistered(string calldata dccsHash) external view returns (bool)",
  "function totalAssets() external view returns (uint256)",
  "function treasuryWallet() external view returns (address)",
  "function name() external view returns (string)",
  "function symbol() external view returns (string)",
  "event AssetRegistered(uint256 indexed assetId, address indexed creator, string dccsHash)",
  "event RoyaltyPaid(uint256 indexed assetId, address indexed creator, uint256 creatorShare, uint256 treasuryShare)",
  "event AssetDeactivated(uint256 indexed assetId, address indexed creator)",
];

const LEGACY_ROYALTY_SPLITTER_ABI = [
  "function distributeRoyalty(address artist) external payable",
  "function getArtistShare() external view returns (uint256)",
  "function getPlatformShare() external view returns (uint256)",
  "function getPlatformAddress() external view returns (address)",
  "event RoyaltyDistributed(address indexed artist, address indexed platform, uint256 artistAmount, uint256 platformAmount, uint256 totalAmount)",
];

const DCCS_REGISTRY_ABI = [
  "function registerLicense(bytes32 dccsCode, string calldata contentHash, string calldata licenseType) external",
  "function revokeLicense(bytes32 dccsCode) external",
  "function verifyLicense(bytes32 dccsCode) external view returns (bool)",
  "function getLicenseData(bytes32 dccsCode) external view returns (tuple(address artist, string contentHash, uint256 timestamp, bool active, string licenseType))",
  "event LicenseRegistered(bytes32 indexed dccsCode, address indexed artist, string contentHash, string licenseType)",
];

const LICENSE_NFT_ABI = [
  "function mintLicense(address to, string calldata uri, address artist, string calldata licenseType) external returns (uint256)",
  "function royaltyInfo(uint256 tokenId, uint256 salePrice) external view returns (address receiver, uint256 royaltyAmount)",
  "function tokenURI(uint256 tokenId) external view returns (string memory)",
  "event LicenseMinted(uint256 indexed tokenId, address indexed artist, address indexed buyer, string licenseType)",
];

const INSTANT_PAYOUT_ABI = [
  "function executeInstantPayout(address artist) external payable",
  "function getArtistPayouts(address artist) external view returns (tuple(address artist, uint256 amount, uint256 timestamp, bytes32 transactionHash)[])",
  "function getTotalPayouts(address artist) external view returns (uint256)",
  "event InstantPayoutExecuted(address indexed artist, uint256 amount, uint256 timestamp, bytes32 indexed transactionHash)",
];

export interface ContractInstances {
  dccsRoyaltySplitter: ethers.Contract;
  royaltySplitter: ethers.Contract;
  dccsRegistry: ethers.Contract;
  licenseNFT: ethers.Contract;
  instantPayout: ethers.Contract;
}

export function getContracts(
  chainId: number,
  signerOrProvider: ethers.Signer | ethers.Provider
): ContractInstances | null {
  const config = getNetworkConfig(chainId);
  if (!config) return null;

  return {
    dccsRoyaltySplitter: new ethers.Contract(
      config.contracts.DCCSRoyaltySplitter || config.contracts.RoyaltySplitter,
      DCCS_ROYALTY_SPLITTER_ABI,
      signerOrProvider
    ),
    royaltySplitter: new ethers.Contract(
      config.contracts.RoyaltySplitter,
      LEGACY_ROYALTY_SPLITTER_ABI,
      signerOrProvider
    ),
    dccsRegistry: new ethers.Contract(
      config.contracts.DCCSRegistry,
      DCCS_REGISTRY_ABI,
      signerOrProvider
    ),
    licenseNFT: new ethers.Contract(
      config.contracts.LicenseNFT,
      LICENSE_NFT_ABI,
      signerOrProvider
    ),
    instantPayout: new ethers.Contract(
      config.contracts.InstantPayout,
      INSTANT_PAYOUT_ABI,
      signerOrProvider
    ),
  };
}

export function generateDCCSCode(
  artistAddress: string,
  contentHash: string,
  timestamp: number
): string {
  const data = ethers.concat([
    ethers.toUtf8Bytes(artistAddress),
    ethers.toUtf8Bytes(contentHash),
    ethers.toBeArray(timestamp),
  ]);
  return ethers.keccak256(data);
}

export function parseDCCSCode(dccsCode: string): string {
  return ethers.hexlify(dccsCode);
}

export async function waitForTransaction(
  tx: ethers.ContractTransactionResponse,
  confirmations: number = 1
): Promise<ethers.ContractTransactionReceipt | null> {
  return await tx.wait(confirmations);
}

export interface DCCSAssetMetadata {
  dccsHash: string;
  creator: string;
  timestamp: bigint;
  isActive: boolean;
}

export async function registerDCCSAsset(
  dccsRoyaltySplitter: ethers.Contract,
  creatorAddress: string,
  dccsHash: string
): Promise<{ assetId: bigint; txHash: string } | null> {
  try {
    const tx = await dccsRoyaltySplitter.registerAsset(creatorAddress, dccsHash);
    const receipt = await tx.wait();

    const event = receipt?.logs
      .map((log: any) => {
        try {
          return dccsRoyaltySplitter.interface.parseLog(log);
        } catch {
          return null;
        }
      })
      .find((e: any) => e?.name === "AssetRegistered");

    return {
      assetId: event?.args?.[0] || BigInt(0),
      txHash: receipt?.hash || ""
    };
  } catch (error) {
    console.error("Failed to register DCCS asset:", error);
    return null;
  }
}

export async function getDCCSAsset(
  dccsRoyaltySplitter: ethers.Contract,
  assetId: bigint
): Promise<DCCSAssetMetadata | null> {
  try {
    const [dccsHash, creator, timestamp, isActive] = await dccsRoyaltySplitter.getAsset(assetId);
    return { dccsHash, creator, timestamp, isActive };
  } catch (error) {
    console.error("Failed to get DCCS asset:", error);
    return null;
  }
}

export async function distributeDCCSRoyalty(
  dccsRoyaltySplitter: ethers.Contract,
  assetId: bigint,
  amountEth: string
): Promise<string | null> {
  try {
    const tx = await dccsRoyaltySplitter.distributeRoyalty(assetId, {
      value: ethers.parseEther(amountEth)
    });
    const receipt = await tx.wait();
    return receipt?.hash || null;
  } catch (error) {
    console.error("Failed to distribute DCCS royalty:", error);
    return null;
  }
}

export async function isDCCSHashRegistered(
  dccsRoyaltySplitter: ethers.Contract,
  dccsHash: string
): Promise<boolean> {
  try {
    return await dccsRoyaltySplitter.isHashRegistered(dccsHash);
  } catch {
    return false;
  }
}
