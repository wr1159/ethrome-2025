/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useFrameContext } from "~/components/providers/frame-provider";
import { sdk } from "@farcaster/miniapp-sdk";

export function TopBar() {
  const frameContext = useFrameContext();

  const handleProfileClick = () => {
    if (frameContext?.context && (frameContext.context as any)?.user?.fid) {
      sdk.actions.viewProfile({ fid: (frameContext.context as any).user.fid });
    }
  };

  const userPfp = frameContext?.context && (frameContext.context as any)?.user?.pfpUrl 
    ? (frameContext.context as any).user.pfpUrl 
    : undefined;

  return (
    <div className="mb-6 mt-3 flex items-center justify-between">
      <img 
        src="/base-logo.png" 
        alt="Base" 
        className="h-8 object-contain"
      />
      
      {userPfp && (
        <button
          onClick={handleProfileClick}
          className="flex-shrink-0"
        >
          <img
            src={userPfp as string}
            alt="Profile"
            className="h-8 w-8 rounded-full object-cover"
          />
        </button>
      )}
    </div>
  );
}
