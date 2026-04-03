import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("🚀 Deploying V3BMusic.ai Smart Contracts to Base Sepolia Testnet...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

  const platformAddress = process.env.PLATFORM_ADDRESS || deployer.address;
  console.log("Platform address:", platformAddress);

  console.log("\n📝 Deploying RoyaltySplitter...");
  const RoyaltySplitter = await ethers.getContractFactory("RoyaltySplitter");
  const royaltySplitter = await RoyaltySplitter.deploy(platformAddress);
  await royaltySplitter.waitForDeployment();
  const royaltySplitterAddress = await royaltySplitter.getAddress();
  console.log("✅ RoyaltySplitter deployed to:", royaltySplitterAddress);
  console.log("   Transaction hash:", royaltySplitter.deploymentTransaction()?.hash);

  await new Promise((resolve) => setTimeout(resolve, 5000));

  console.log("\n📝 Deploying DCCSRegistry...");
  const DCCSRegistry = await ethers.getContractFactory("DCCSRegistry");
  const dccsRegistry = await DCCSRegistry.deploy();
  await dccsRegistry.waitForDeployment();
  const dccsRegistryAddress = await dccsRegistry.getAddress();
  console.log("✅ DCCSRegistry deployed to:", dccsRegistryAddress);
  console.log("   Transaction hash:", dccsRegistry.deploymentTransaction()?.hash);

  await new Promise((resolve) => setTimeout(resolve, 5000));

  console.log("\n📝 Deploying LicenseNFT...");
  const LicenseNFT = await ethers.getContractFactory("LicenseNFT");
  const licenseNFT = await LicenseNFT.deploy();
  await licenseNFT.waitForDeployment();
  const licenseNFTAddress = await licenseNFT.getAddress();
  console.log("✅ LicenseNFT deployed to:", licenseNFTAddress);
  console.log("   Transaction hash:", licenseNFT.deploymentTransaction()?.hash);

  await new Promise((resolve) => setTimeout(resolve, 5000));

  console.log("\n📝 Deploying InstantPayout...");
  const InstantPayout = await ethers.getContractFactory("InstantPayout");
  const instantPayout = await InstantPayout.deploy(royaltySplitterAddress);
  await instantPayout.waitForDeployment();
  const instantPayoutAddress = await instantPayout.getAddress();
  console.log("✅ InstantPayout deployed to:", instantPayoutAddress);
  console.log("   Transaction hash:", instantPayout.deploymentTransaction()?.hash);

  console.log("\n✨ Deployment Summary:");
  console.log("═══════════════════════════════════════════════════════");
  console.log("RoyaltySplitter:", royaltySplitterAddress);
  console.log("DCCSRegistry:   ", dccsRegistryAddress);
  console.log("LicenseNFT:     ", licenseNFTAddress);
  console.log("InstantPayout:  ", instantPayoutAddress);
  console.log("═══════════════════════════════════════════════════════");

  const deploymentInfo = {
    network: "base-sepolia",
    chainId: 84532,
    timestamp: new Date().toISOString(),
    contracts: {
      RoyaltySplitter: royaltySplitterAddress,
      DCCSRegistry: dccsRegistryAddress,
      LicenseNFT: licenseNFTAddress,
      InstantPayout: instantPayoutAddress,
    },
    deployer: deployer.address,
    platformAddress,
  };

  const deploymentsDir = path.join(__dirname, "../../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentPath = path.join(deploymentsDir, "base-sepolia.json");
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));

  console.log("\n💾 Deployment info saved to:", deploymentPath);

  console.log("\n🔍 Verification commands:");
  console.log(`npx hardhat verify --network base-sepolia ${royaltySplitterAddress} "${platformAddress}"`);
  console.log(`npx hardhat verify --network base-sepolia ${dccsRegistryAddress}`);
  console.log(`npx hardhat verify --network base-sepolia ${licenseNFTAddress}`);
  console.log(`npx hardhat verify --network base-sepolia ${instantPayoutAddress} "${royaltySplitterAddress}"`);

  console.log("\n🎉 Deployment completed successfully!");
  console.log("🌐 View on BaseScan: https://sepolia.basescan.org/address/" + royaltySplitterAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
