/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useFrameContext } from "~/components/providers/FrameProvider";
import { useAccount } from "wagmi";
import { SignInAction } from "~/components/actions/signin";
import { QuickAuthAction } from "~/components/actions/quick-auth";
import { OpenUrlAction } from "~/components/actions/openurl";
import { OpenMiniAppAction } from "~/components/actions/open-miniapp";
import { FarcasterAction } from "~/components/actions/farcaster";
import { ViewProfileAction } from "~/components/actions/view-profile";
import { ViewTokenAction } from "~/components/actions/view-token";
import { SwapTokenAction } from "~/components/actions/swap-token";
import { SendTokenAction } from "~/components/actions/send-token";
import { ViewCastAction } from "~/components/actions/view-cast";
import { ComposeCastAction } from "~/components/actions/compose-cast";
import { SetPrimaryButtonAction } from "~/components/actions/set-primary-button";
import { CloseFrameAction } from "~/components/actions/close-frame";
import { WalletConnect, SignMessage, SendEth, SignTypedData, SwitchChain, SendTransaction, GetEthereumProvider } from "~/components/wallet/WalletActions";
import { BasePay } from "~/components/wallet/BasePay";
import { GetChainsAction } from "~/components/actions/get-chains";
import { GetCapabilitiesAction } from "~/components/actions/get-capabilities";

type TabType = "actions" | "context" | "wallet" | "other";

interface DemoProps {
  title?: string;
}

export default function Demo({ title = "Base App Mini App Demo" }: DemoProps) {
  const frameContext = useFrameContext();
  const { isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<TabType>("actions");
  const [isFullObjectOpen, setIsFullObjectOpen] = useState<boolean>(false);

  const toggleFullObject = (): void => {
    setIsFullObjectOpen(prev => !prev);
  };

  return (
    <div style={{ 
      marginTop: (frameContext?.context as any)?.client?.safeAreaInsets?.top ?? 0,
      marginBottom: (frameContext?.context as any)?.client?.safeAreaInsets?.bottom ?? 0,
      marginLeft: (frameContext?.context as any)?.client?.safeAreaInsets?.left ?? 0,
      marginRight: (frameContext?.context as any)?.client?.safeAreaInsets?.right ?? 0,
    }}>
      <div className="w-[300px] mx-auto py-4 px-4">
        <h1 className="text-2xl font-bold text-center mb-6 text-foreground">{title}</h1>

        <div className="mb-6">
          <h3 className="font-semibold text-foreground mb-3">Connection Status</h3>
          <div className="p-4 bg-muted border border-border rounded-lg">
            <span className="font-mono text-sm text-primary font-medium">
              {frameContext ? (frameContext.isInMiniApp ?? false).toString() : 'false'}
            </span>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex border-b border-border bg-background">
            <button
              onClick={() => setActiveTab("actions")}
              className={`px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === "actions"
                  ? "border-b-2 border-primary text-primary bg-primary/5"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              Actions
            </button>
            <button
              onClick={() => setActiveTab("context")}
              className={`px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === "context"
                  ? "border-b-2 border-primary text-primary bg-primary/5"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              Context
            </button>
            <button
              onClick={() => setActiveTab("wallet")}
              className={`px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === "wallet"
                  ? "border-b-2 border-primary text-primary bg-primary/5"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              Wallet
            </button>
            <button
              onClick={() => setActiveTab("other")}
              className={`px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === "other"
                  ? "border-b-2 border-primary text-primary bg-primary/5"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              Other
            </button>
          </div>
        </div>

        {activeTab === "actions" && (
          <div>
            <SignInAction />
            <QuickAuthAction />
            <OpenUrlAction />
            <OpenMiniAppAction />
            <FarcasterAction />
            <ViewProfileAction />
            <ViewTokenAction />
            <SwapTokenAction />
            <SendTokenAction />
            <ViewCastAction />
            <ComposeCastAction />
            <SetPrimaryButtonAction />
            <CloseFrameAction />
          </div>
        )}

        {activeTab === "context" && (
          <div>
            <div className="mb-4">
              <button
                onClick={toggleFullObject}
                className="flex items-center gap-2 transition-colors"
              >
                <span
                  className={`transform transition-transform ${
                    isFullObjectOpen ? "rotate-90" : ""
                  }`}
                >
                  ➤
                </span>
                Tap to see full object
              </button>

              {isFullObjectOpen && (
                <div className="p-4 mt-2 bg-muted border border-border rounded-lg">
                  <pre className="font-mono text-xs whitespace-pre-wrap break-words max-w-[260px] overflow-x- text-primary">
                    {frameContext?.context ? JSON.stringify(frameContext.context, null, 2) : 'null'}
                  </pre>
                </div>
              )}
            </div>

            {frameContext?.context && (
              <div className="space-y-3">
                {Object.entries(frameContext.context as Record<string, unknown>).map(([key, value]) => (
                  <div key={key}>
                    <h4 className="font-semibold text-sm mb-2 text-foreground">{key}</h4>
                    <div className="p-3 bg-muted border border-border rounded-lg">
                      <pre className="font-mono text-xs text-primary whitespace-pre-wrap break-words">
                        {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!frameContext?.context && (
              <div className="p-4 bg-muted border border-border rounded-lg">
                <span className="font-mono text-xs text-muted-foreground">
                  ⚠️ No context data available
                </span>
              </div>
            )}
          </div>
        )}

        {activeTab === "wallet" && (
          <div>
            <BasePay />
            <WalletConnect />
            <div className="mb-4">
              <GetEthereumProvider />
            </div>
            <div className="mb-4">
              <SignMessage />
            </div>
            {isConnected && (
              <>
                <div className="mb-4">
                  <SendEth />
                </div>
                <div className="mb-4">
                  <SendTransaction />
                </div>
                <div className="mb-4">
                  <SignTypedData />
                </div>
                <div className="mb-4">
                  <SwitchChain />
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === "other" && (
          <div>
            <GetChainsAction />
            <GetCapabilitiesAction />
          </div>
        )}
      </div>
    </div>
  );
}
