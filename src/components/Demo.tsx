/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { useFrameContext } from "~/components/providers/FrameProvider";
import { useAccount } from "wagmi";
import { SignInAction } from "~/components/actions/signin";
import { QuickAuthAction } from "~/components/actions/quick-auth";
import { OpenMiniAppAction } from "~/components/actions/open-miniapp";
import { FarcasterAction as OpenUrlAction } from "~/components/actions/farcaster";
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
type ActionPageType = "list" | "signin" | "quickauth" | "openurl" | "openminiapp" | "farcaster" | "viewprofile" | "viewtoken" | "swaptoken" | "sendtoken" | "viewcast" | "composecast" | "setprimarybutton" | "closeframe";

interface ActionDefinition {
  id: ActionPageType;
  name: string;
  description: string;
  component: React.ComponentType;
}

export default function Demo() {
  const frameContext = useFrameContext();
  const { isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<TabType>("actions");
  const [currentActionPage, setCurrentActionPage] = useState<ActionPageType>("list");
  const [isFullObjectOpen, setIsFullObjectOpen] = useState<boolean>(false);

  const toggleFullObject = (): void => {
    setIsFullObjectOpen(prev => !prev);
  };

  const actionDefinitions: ActionDefinition[] = [
    { id: "signin", name: "Sign In", description: "Authenticate with Farcaster", component: SignInAction },
    { id: "quickauth", name: "Quick Auth", description: "Quick authentication flow", component: QuickAuthAction },
    { id: "openminiapp", name: "Open Mini App", description: "Launch another mini app", component: OpenMiniAppAction },
    { id: "openurl", name: "Open URL", description: "Open external URLs", component: OpenUrlAction },
    { id: "viewprofile", name: "View Profile", description: "View user profiles", component: ViewProfileAction },
    { id: "viewtoken", name: "View Token", description: "Display token information", component: ViewTokenAction },
    { id: "swaptoken", name: "Swap Token", description: "Token swapping functionality", component: SwapTokenAction },
    { id: "sendtoken", name: "Send Token", description: "Send tokens to users", component: SendTokenAction },
    { id: "viewcast", name: "View Cast", description: "Display Farcaster casts", component: ViewCastAction },
    { id: "composecast", name: "Compose Cast", description: "Create new casts", component: ComposeCastAction },
    { id: "setprimarybutton", name: "Set Primary Button", description: "Configure primary button", component: SetPrimaryButtonAction },
    { id: "closeframe", name: "Close Frame", description: "Close the current frame", component: CloseFrameAction },
  ];

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    if (tab === "actions") {
      setCurrentActionPage("list");
    }
  };

  const handleActionSelect = (actionId: ActionPageType) => {
    setCurrentActionPage(actionId);
  };

  const handleBackToActionList = () => {
    setCurrentActionPage("list");
  };

  return (
    <div style={{ 
      marginTop: (frameContext?.context as any)?.client?.safeAreaInsets?.top ?? 0,
      marginBottom: (frameContext?.context as any)?.client?.safeAreaInsets?.bottom ?? 0,
      marginLeft: (frameContext?.context as any)?.client?.safeAreaInsets?.left ?? 0,
      marginRight: (frameContext?.context as any)?.client?.safeAreaInsets?.right ?? 0,
    }}>
      <div className="w-[95%] max-w-lg mx-auto py-4 px-4">
        <div className="mb-6 mt-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="/base-logo.png" 
            alt="Base" 
            className="h-8 object-contain"
          />
        </div>

        <div className="mb-6 mt-4">
          <div className="flex gap-2 p-1 bg-white border border-border rounded-lg">
              <button
                onClick={() => handleTabChange("actions")}
                className={`px-4 py-2 text-sm font-medium transition-all duration-200 rounded-md whitespace-nowrap ${
                  activeTab === "actions"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-background"
                }`}
              >
                Actions
              </button>
              <button
                onClick={() => handleTabChange("context")}
                className={`px-4 py-2 text-sm font-medium transition-all duration-200 rounded-md whitespace-nowrap ${
                  activeTab === "context"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-background"
                }`}
              >
                Context
              </button>
              <button
                onClick={() => handleTabChange("wallet")}
                className={`px-4 py-2 text-sm font-medium transition-all duration-200 rounded-md whitespace-nowrap ${
                  activeTab === "wallet"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-background"
                }`}
              >
                Wallet
              </button>
              <button
                onClick={() => handleTabChange("other")}
                className={`px-4 py-2 text-sm font-medium transition-all duration-200 rounded-md whitespace-nowrap ${
                  activeTab === "other"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-background"
                }`}
              >
                Other
              </button>
          </div>
        </div>

        {activeTab === "actions" && (
          <div>
            {currentActionPage === "list" ? (
              <div className="space-y-2">
                {actionDefinitions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => handleActionSelect(action.id)}
                    className="w-full px-4 py-3 text-left bg-white border border-border rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-all duration-200"
                  >
                    <div>
                      <h3 className="font-normal text-foreground">{action.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{action.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <button
                    onClick={handleBackToActionList}
                    className="p-2 hover:bg-blue-50 rounded-md transition-colors"
                  >
                    <span className="text-muted-foreground">←</span>
                  </button>
                  <h2 className="font-semibold text-foreground">
                    {actionDefinitions.find(a => a.id === currentActionPage)?.name}
                  </h2>
                </div>
                <div className="border border-border rounded-lg p-4 bg-white">
                  {(() => {
                    const ActionComponent = actionDefinitions.find(a => a.id === currentActionPage)?.component;
                    return ActionComponent ? <ActionComponent /> : null;
                  })()}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "context" && (
          <div>
            <div className="mb-6">
              <h3 className="font-semibold text-foreground mb-3">isInMiniApp</h3>
              <div className="p-4 bg-white border border-border rounded-lg">
                <span className="font-mono text-sm text-primary font-medium">
                  {frameContext ? (frameContext.isInMiniApp ?? false).toString() : 'false'}
                </span>
              </div>
            </div>
            
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
                Tap to see full context object
              </button>

              {isFullObjectOpen && (
                <div className="p-4 mt-2 bg-white border border-border rounded-lg">
                  <pre className="font-mono text-xs whitespace-pre-wrap break-words max-w-[310px] overflow-x-auto text-primary">
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
                    <div className="p-3 bg-white border border-border rounded-lg">
                      <pre className="font-mono text-xs text-primary whitespace-pre-wrap break-words">
                        {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!frameContext?.context && (
              <div className="p-4 bg-white border border-border rounded-lg">
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
