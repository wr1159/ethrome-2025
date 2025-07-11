"use client";

import { useState } from "react";
import { useFrameContext } from "~/components/providers/FrameProvider";
import { useAccount } from "wagmi";
import { SignInAction } from "~/components/actions/signin";
import { QuickAuthAction } from "~/components/actions/quick-auth";
import { OpenUrlAction } from "~/components/actions/openurl";
import { FarcasterAction } from "~/components/actions/farcaster";
import { ViewProfileAction } from "~/components/actions/view-profile";
import { ViewTokenAction } from "~/components/actions/view-token";
import { SwapTokenAction } from "~/components/actions/swap-token";
import { ViewCastAction } from "~/components/actions/view-cast";
import { ComposeCastAction } from "~/components/actions/compose-cast";
import { SetPrimaryButtonAction } from "~/components/actions/set-primary-button";
import { CloseFrameAction } from "~/components/actions/close-frame";
import { WalletConnect, SignMessage, SendEth, SignTypedData, SwitchChain, SendTransaction } from "~/components/wallet/WalletActions";
import { GetChainsAction } from "~/components/actions/get-chains";
import { GetCapabilitiesAction } from "~/components/actions/get-capabilities";

type TabType = "actions" | "context" | "wallet" | "other";

interface DemoProps {
  title?: string;
}

export default function Demo({ title = "CBW Mini App Demo" }: DemoProps) {
  const frameContext = useFrameContext();
  const { isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<TabType>("actions");
  const [isFullObjectOpen, setIsFullObjectOpen] = useState<boolean>(false);

  const toggleFullObject = (): void => {
    setIsFullObjectOpen(prev => !prev);
  };

  return (
    <div style={{ 
      paddingTop: frameContext?.context?.client.safeAreaInsets?.top ?? 0, 
      paddingBottom: frameContext?.context?.client.safeAreaInsets?.bottom ?? 0,
      paddingLeft: frameContext?.context?.client.safeAreaInsets?.left ?? 0,
      paddingRight: frameContext?.context?.client.safeAreaInsets?.right ?? 0,
    }}>
      <div className="w-[300px] mx-auto py-2 px-2">
        <h1 className="text-2xl font-bold text-center mb-4">{title}</h1>

        <div className="mb-4">
          <h3 className="font-bold">isInMiniApp</h3>
          <div className="p-4 mt-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <span className="font-mono text-xs text-emerald-500 dark:text-emerald-400">
              {frameContext ? (frameContext.isInMiniApp ?? false).toString() : 'false'}
            </span>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab("actions")}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === "actions"
                  ? "border-b-2 border-[#7C65C1] text-[#7C65C1]"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              Actions
            </button>
            <button
              onClick={() => setActiveTab("context")}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === "context"
                  ? "border-b-2 border-[#7C65C1] text-[#7C65C1]"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              Context
            </button>
            <button
              onClick={() => setActiveTab("wallet")}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === "wallet"
                  ? "border-b-2 border-[#7C65C1] text-[#7C65C1]"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              Wallet
            </button>
            <button
              onClick={() => setActiveTab("other")}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === "other"
                  ? "border-b-2 border-[#7C65C1] text-[#7C65C1]"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
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
            <FarcasterAction />
            <ViewProfileAction />
            <ViewTokenAction />
            <SwapTokenAction />
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
                <div className="p-4 mt-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <pre className="font-mono text-xs whitespace-pre-wrap break-words max-w-[260px] overflow-x- text-emerald-500 dark:text-emerald-400">
                    {frameContext?.context ? JSON.stringify(frameContext.context, null, 2) : 'null'}
                  </pre>
                </div>
              )}
            </div>

            {frameContext?.context && (
              <div className="space-y-3">
                {Object.entries(frameContext.context).map(([key, value]) => (
                  <div key={key}>
                    <h4 className="font-bold text-sm mb-1">{key}</h4>
                    <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                      <pre className="font-mono text-xs text-emerald-500 dark:text-emerald-400 whitespace-pre-wrap break-words">
                        {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!frameContext?.context && (
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <span className="font-mono text-xs text-emerald-500 dark:text-emerald-400">
                  ⚠️ No context data available
                </span>
              </div>
            )}
          </div>
        )}

        {activeTab === "wallet" && (
          <div>
            <WalletConnect />
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
