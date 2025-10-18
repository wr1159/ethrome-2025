import { useMemo } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { useCapabilities, useWriteContracts } from "wagmi/experimental";
import { avatarNftAbi, avatarNftAddress } from "~/generated";
import { Button } from "../ui/button";

interface MintButtonProps {
  fid: number;
  tokenURI: string;
}
export default function MintButton({ fid, tokenURI }: MintButtonProps) {
  const account = useAccount();
  const { writeContracts } = useWriteContracts();
  const { writeContract } = useWriteContract();
  const { data: availableCapabilities } = useCapabilities({
    account: account.address,
  });

  console.log("Available capabilities:", availableCapabilities);

  const capabilities = useMemo(() => {
    if (!availableCapabilities || !account.chainId) return {};
    const capabilitiesForChain = availableCapabilities[account.chainId];
    if (
      capabilitiesForChain["paymasterService"] &&
      capabilitiesForChain["paymasterService"].supported
    ) {
      return {
        paymasterService: {
          url: `https://api.developer.coinbase.com/rpc/v1/base/v7HqDLjJY4e28qgIDAAN4JNYXnz88mJZ`,
        },
      };
    }
    return {};
  }, [availableCapabilities, account.chainId]);

  const handleSponsoredMint = async () => {
    try {
      const contractAddress =
        avatarNftAddress[account.chainId as keyof typeof avatarNftAddress];

      if (!contractAddress) {
        const availableChains = Object.keys(avatarNftAddress).join(", ");
        throw new Error(
          `Contract not deployed on chain ${account.chainId}. Available chains: ${availableChains}. Please switch to Base Sepolia (84532).`
        );
      }

      if (fid <= 0) {
        throw new Error(
          "Invalid FID. Please make sure you're connected with Farcaster."
        );
      }

      if (capabilities) {
        await writeContracts({
          contracts: [
            {
              address: contractAddress,
              abi: avatarNftAbi,
              functionName: "mint",
              args: [BigInt(fid), tokenURI],
            },
          ],
          capabilities,
        });
        return;
      }

      await writeContract({
        address: contractAddress,
        abi: avatarNftAbi,
        functionName: "mint",
        args: [BigInt(fid), tokenURI],
      });
    } catch (error) {
      console.error("Mint failed:", error);
    }
  };

  return <Button onClick={handleSponsoredMint}>Mint NFT</Button>;
}
