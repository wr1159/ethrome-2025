/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "~/components/ui/button";
import { useState, ChangeEvent } from "react";
import { useAccount, useConnect, useDisconnect, useSignMessage, useSwitchChain, useSendTransaction } from "wagmi";
import { parseEther, createWalletClient, custom, type Address } from "viem";
import { base, optimism } from "viem/chains";
import { SiweMessage } from "siwe";
import { truncateAddress } from "~/lib/truncateAddress";

export function WalletConnect() {
  const { address, isConnected } = useAccount();
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected && address) {
    return (
      <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-white">
        <div>
          <div className="font-medium text-sm">Connected</div>
          <div className="text-xs text-muted-foreground font-mono">{truncateAddress(address)}</div>
        </div>
        <Button
          onClick={() => disconnect()}
          variant="outline"
          size="sm"
        >
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {connectors.map((connector) => (
        <Button
          key={connector.uid}
          onClick={() => connect({ connector })}
          variant="outline"
          className="w-full"
        >
          Connect
        </Button>
      ))}
    </div>
  );
}

export function SignMessage() {
  const [message, setMessage] = useState("Hello from my mini app!");
  const { signMessage, data: signature, isPending } = useSignMessage();

  const handleSign = () => {
    signMessage({ message });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium mb-2">Message to Sign</label>
        <textarea
          value={message}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
          className="w-full p-2 border border-border rounded text-sm"
          rows={3}
          placeholder="Enter message to sign"
        />
      </div>
      
      <Button
        onClick={handleSign}
        disabled={isPending}
        className="w-full"
      >
        {isPending ? "Signing..." : "Sign Message"}
      </Button>

      {signature && (
        <div className="mt-3">
          <div className="text-sm font-medium mb-2">Signature:</div>
          <div className="p-2 bg-muted rounded text-xs font-mono break-all">
            {signature}
          </div>
        </div>
      )}
    </div>
  );
}

export function SignSiweMessage() {
  const { address } = useAccount();
  const { signMessage, data: signature, isPending } = useSignMessage();

  const handleSignSiwe = () => {
    if (!address) return;

    const message = new SiweMessage({
      domain: window.location.host,
      address,
      statement: "Sign in with Ethereum to this mini app.",
      uri: window.location.origin,
      version: "1",
      chainId: 8453,
      nonce: Math.random().toString(36).substring(7),
    });

    signMessage({ message: message.prepareMessage() });
  };

  return (
    <div className="space-y-3">
      <Button
        onClick={handleSignSiwe}
        disabled={isPending || !address}
        className="w-full"
      >
        {isPending ? "Signing..." : "Sign SIWE Message"}
      </Button>

      {signature && (
        <div className="mt-3">
          <div className="text-sm font-medium mb-2">SIWE Signature:</div>
          <div className="p-2 bg-muted rounded text-xs font-mono break-all">
            {signature}
          </div>
        </div>
      )}
    </div>
  );
}

export function SendEth() {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("0.001");
  const { sendTransaction, data: hash, isPending } = useSendTransaction();

  const handleSend = () => {
    if (!recipient || !amount) return;

    sendTransaction({
      to: recipient as Address,
      value: parseEther(amount),
    });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium mb-2">Recipient Address</label>
        <input
          type="text"
          value={recipient}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setRecipient(e.target.value)}
          className="w-full p-2 border border-border rounded text-sm"
          placeholder="0x..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Amount (ETH)</label>
        <input
          type="number"
          value={amount}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
          className="w-full p-2 border border-border rounded text-sm"
          step="0.001"
          min="0"
          placeholder="0.001"
        />
      </div>

      <Button
        onClick={handleSend}
        disabled={isPending || !recipient || !amount}
        className="w-full"
      >
        {isPending ? "Sending..." : "Send ETH"}
      </Button>

      {hash && (
        <div className="mt-3">
          <div className="text-sm font-medium mb-2">Transaction Hash:</div>
          <div className="p-2 bg-muted rounded text-xs font-mono break-all">
            {hash}
          </div>
        </div>
      )}
    </div>
  );
}

export function SendTransaction() {
  const [to, setTo] = useState("");
  const [data, setData] = useState("");
  const [value, setValue] = useState("0");
  const { sendTransaction, data: hash, isPending } = useSendTransaction();

  const handleSend = () => {
    if (!to) return;

    sendTransaction({
      to: to as Address,
      data: data as `0x${string}`,
      value: parseEther(value),
    });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium mb-2">To Address</label>
        <input
          type="text"
          value={to}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setTo(e.target.value)}
          className="w-full p-2 border border-border rounded text-sm"
          placeholder="0x..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Data (optional)</label>
        <input
          type="text"
          value={data}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setData(e.target.value)}
          className="w-full p-2 border border-border rounded text-sm"
          placeholder="0x..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Value (ETH)</label>
        <input
          type="number"
          value={value}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
          className="w-full p-2 border border-border rounded text-sm"
          step="0.001"
          min="0"
          placeholder="0"
        />
      </div>

      <Button
        onClick={handleSend}
        disabled={isPending || !to}
        className="w-full"
      >
        {isPending ? "Sending..." : "Send Transaction"}
      </Button>

      {hash && (
        <div className="mt-3">
          <div className="text-sm font-medium mb-2">Transaction Hash:</div>
          <div className="p-2 bg-muted rounded text-xs font-mono break-all">
            {hash}
          </div>
        </div>
      )}
    </div>
  );
}

export function SignTypedData() {
  const { address } = useAccount();
  const [signature, setSignature] = useState("");
  const [isPending, setIsPending] = useState(false);

  const handleSignTypedData = async () => {
    if (!address || !window.ethereum) return;

    setIsPending(true);
    try {
      const client = createWalletClient({
        account: address,
        chain: base,
        transport: custom(window.ethereum as any),
      });

      const domain = {
        name: "Mini App",
        version: "1",
        chainId: 8453,
        verifyingContract: "0x0000000000000000000000000000000000000000" as Address,
      };

      const types = {
        Person: [
          { name: "name", type: "string" },
          { name: "wallet", type: "address" },
        ],
        Mail: [
          { name: "from", type: "Person" },
          { name: "to", type: "Person" },
          { name: "contents", type: "string" },
        ],
      };

      const message = {
        from: {
          name: "Alice",
          wallet: "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB" as Address,
        },
        to: {
          name: "Bob",
          wallet: address,
        },
        contents: "Hello from the mini app!",
      };

      const sig = await client.signTypedData({
        domain,
        types,
        primaryType: "Mail",
        message,
      });

      setSignature(sig);
    } catch (error) {
      console.error("Error signing typed data:", error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="space-y-3">
      <Button
        onClick={handleSignTypedData}
        disabled={isPending || !address}
        className="w-full"
      >
        {isPending ? "Signing..." : "Sign Typed Data"}
      </Button>

      {signature && (
        <div className="mt-3">
          <div className="text-sm font-medium mb-2">Typed Data Signature:</div>
          <div className="p-2 bg-muted rounded text-xs font-mono break-all">
            {signature}
          </div>
        </div>
      )}
    </div>
  );
}

export function SwitchChain() {
  const { chain: currentChain } = useAccount();
  const { switchChain, isPending } = useSwitchChain();

  const chains = [
    { id: base.id, name: "Base" },
    { id: optimism.id, name: "Optimism" },
  ];

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium">Switch Chain</div>
      {currentChain && (
        <div className="text-xs text-muted-foreground">
          Currently on: <span className="font-medium">{currentChain.name}</span>
        </div>
      )}
      <div className="flex gap-2">
        {chains.map((chain) => {
          const isActive = currentChain?.id === chain.id;
          return (
            <Button
              key={chain.id}
              onClick={() => switchChain({ chainId: chain.id })}
              disabled={isPending || isActive}
              variant={isActive ? "default" : "outline"}
              className="flex-1"
            >
              {isPending ? "Switching..." : chain.name}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

declare global {
  interface Window {
    ethereum?: Record<string, unknown>;
  }
}
