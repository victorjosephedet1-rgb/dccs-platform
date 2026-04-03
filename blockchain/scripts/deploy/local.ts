import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying V3BMusic.ai Smart Contracts to Local Network...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

  const platformAddress = deployer.address;

  console.log("📝 Deploying RoyaltySplitter...");
  const RoyaltySplitter = await ethers.getContractFactory("RoyaltySplitter");
  const royaltySplitter = await RoyaltySplitter.deploy(platformAddress);
  await royaltySplitter.waitForDeployment();
  const royaltySplitterAddress = await royaltySplitter.getAddress();
  console.log("✅ RoyaltySplitter deployed to:", royaltySplitterAddress);

  console.log("\n📝 Deploying DCCSRegistry...");
  const DCCSRegistry = await ethers.getContractFactory("DCCSRegistry");
  const dccsRegistry = await DCCSRegistry.deploy();
  await dccsRegistry.waitForDeployment();
  const dccsRegistryAddress = await dccsRegistry.getAddress();
  console.log("✅ DCCSRegistry deployed to:", dccsRegistryAddress);

  console.log("\n📝 Deploying LicenseNFT...");
  const LicenseNFT = await ethers.getContractFactory("LicenseNFT");
  const licenseNFT = await LicenseNFT.deploy();
  await licenseNFT.waitForDeployment();
  const licenseNFTAddress = await licenseNFT.getAddress();
  console.log("✅ LicenseNFT deployed to:", licenseNFTAddress);

  console.log("\n📝 Deploying InstantPayout...");
  const InstantPayout = await ethers.getContractFactory("InstantPayout");
  const instantPayout = await InstantPayout.deploy(royaltySplitterAddress);
  await instantPayout.waitForDeployment();
  const instantPayoutAddress = await instantPayout.getAddress();
  console.log("✅ InstantPayout deployed to:", instantPayoutAddress);

  console.log("\n✨ Deployment Summary:");
  console.log("═══════════════════════════════════════════════════════");
  console.log("RoyaltySplitter:", royaltySplitterAddress);
  console.log("DCCSRegistry:   ", dccsRegistryAddress);
  console.log("LicenseNFT:     ", licenseNFTAddress);
  console.log("InstantPayout:  ", instantPayoutAddress);
  console.log("═══════════════════════════════════════════════════════");

  const deploymentInfo = {
    network: "localhost",
    chainId: 1337,
    timestamp: new Date().toISOString(),
    contracts: {
      RoyaltySplitter: royaltySplitterAddress,
      DCCSRegistry: dccsRegistryAddress,
      LicenseNFT: licenseNFTAddress,
      InstantPayout: instantPayoutAddress,
    },
    deployer: deployer.address,
  };

  console.log("\n💾 Deployment Configuration:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  console.log("\n🎉 Deployment completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
