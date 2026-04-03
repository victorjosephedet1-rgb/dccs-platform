import { useState } from "react";
import { ethers } from "ethers";
import { useWeb3 } from "../contexts/Web3Context";
import { generateDCCSCode, waitForTransaction } from "../lib/web3/contracts";
import { LicenseData, RoyaltyDistribution, PayoutRecord } from "../shared/types/contracts";

export function useBlockchain() {
  const { contracts, account, signer } = useWeb3();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const registerLicense = async (
    contentHash: string,
    licenseType: string
  ): Promise<string | null> => {
    if (!contracts || !account || !signer) {
      setError("Wallet not connected");
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const dccsCode = generateDCCSCode(account, contentHash, Date.now());

      const tx = await contracts.dccsRegistry.registerLicense(
        dccsCode,
        contentHash,
        licenseType
      );

      await waitForTransaction(tx);

      setIsLoading(false);
      return dccsCode;
    } catch (err: any) {
      setError(err.message || "Failed to register license");
      setIsLoading(false);
      return null;
    }
  };

  const verifyLicense = async (dccsCode: string): Promise<boolean> => {
    if (!contracts) {
      setError("Wallet not connected");
      return false;
    }

    try {
      return await contracts.dccsRegistry.verifyLicense(dccsCode);
    } catch (err: any) {
      setError(err.message || "Failed to verify license");
      return false;
    }
  };

  const getLicenseData = async (dccsCode: string): Promise<LicenseData | null> => {
    if (!contracts) {
      setError("Wallet not connected");
      return null;
    }

    try {
      const data = await contracts.dccsRegistry.getLicenseData(dccsCode);
      return {
        artist: data[0],
        contentHash: data[1],
        timestamp: data[2],
        active: data[3],
        licenseType: data[4],
      };
    } catch (err: any) {
      setError(err.message || "Failed to get license data");
      return null;
    }
  };

  const executeInstantPayout = async (
    artistAddress: string,
    amount: string
  ): Promise<string | null> => {
    if (!contracts || !signer) {
      setError("Wallet not connected");
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const amountWei = ethers.parseEther(amount);

      const tx = await contracts.instantPayout.executeInstantPayout(artistAddress, {
        value: amountWei,
      });

      const receipt = await waitForTransaction(tx);

      setIsLoading(false);
      return receipt?.hash || null;
    } catch (err: any) {
      setError(err.message || "Failed to execute payout");
      setIsLoading(false);
      return null;
    }
  };

  const getArtistPayouts = async (artistAddress: string): Promise<PayoutRecord[]> => {
    if (!contracts) {
      setError("Wallet not connected");
      return [];
    }

    try {
      const payouts = await contracts.instantPayout.getArtistPayouts(artistAddress);
      return payouts.map((p: any) => ({
        artist: p[0],
        amount: p[1],
        timestamp: p[2],
        transactionHash: p[3],
      }));
    } catch (err: any) {
      setError(err.message || "Failed to get artist payouts");
      return [];
    }
  };

  const mintLicense = async (
    recipientAddress: string,
    metadataUri: string,
    artistAddress: string,
    licenseType: string
  ): Promise<number | null> => {
    if (!contracts || !signer) {
      setError("Wallet not connected");
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const tx = await contracts.licenseNFT.mintLicense(
        recipientAddress,
        metadataUri,
        artistAddress,
        licenseType
      );

      const receipt = await waitForTransaction(tx);

      const event = receipt?.logs
        .map((log) => {
          try {
            return contracts.licenseNFT.interface.parseLog(log);
          } catch {
            return null;
          }
        })
        .find((event) => event?.name === "LicenseMinted");

      const tokenId = event?.args?.[0];

      setIsLoading(false);
      return tokenId ? Number(tokenId) : null;
    } catch (err: any) {
      setError(err.message || "Failed to mint license");
      setIsLoading(false);
      return null;
    }
  };

  return {
    registerLicense,
    verifyLicense,
    getLicenseData,
    executeInstantPayout,
    getArtistPayouts,
    mintLicense,
    isLoading,
    error,
    clearError: () => setError(null),
  };
}
