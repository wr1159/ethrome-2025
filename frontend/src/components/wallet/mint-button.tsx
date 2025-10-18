import { useMemo } from "react";
import { useAccount, useSwitchChain, useWriteContract } from "wagmi";
import { useCapabilities, useWriteContracts } from "wagmi/experimental";
import { avatarNftAbi, avatarNftAddress } from "~/generated";
import { Button } from "../ui/button";
import { baseSepolia } from "wagmi/chains";
import { toast } from "sonner";

interface MintButtonProps {
  fid: number;
  tokenURI: string;
}
export default function MintButton({ fid, tokenURI }: MintButtonProps) {
  const account = useAccount();
  const { writeContracts } = useWriteContracts();
  const { switchChain, isPending } = useSwitchChain();
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
    if (account.chainId !== baseSepolia.id) {
      await switchChain({ chainId: baseSepolia.id });
    }

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

      console.log("=== MINT DEBUG INFO ===");
      console.log("FID:", fid);
      console.log("TokenURI:", tokenURI);
      console.log("Account chainId:", account.chainId);
      console.log("Contract address:", contractAddress);
      console.log("Capabilities:", capabilities);

      // NOTE: Doesn't work on web for some reason with EOA
      if (Object.keys(capabilities).length > 0) {
        console.log("Attempting sponsored transaction with writeContracts...");
        const result = await writeContracts({
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
        console.log("writeContracts result:", result);
        toast.success("NFT minted successfully with sponsored transaction!");
        return;
      }

      // Fallback to regular writeContract
      console.log("Attempting regular transaction with writeContract...");
      await writeContract({
        address: contractAddress,
        abi: avatarNftAbi,
        functionName: "mint",
        args: [BigInt(fid), tokenURI],
      });
      toast.success("NFT minted successfully!");
    } catch (error) {
      console.error("Mint failed:", error);
      toast.error(
        "Mint failed: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    }
  };

  return <Button onClick={handleSponsoredMint}>Mint NFT</Button>;
}
