"use client";

import { useState, useCallback } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import { Button } from "~/components/ui/Button";

export function FarcasterAction() {
  const [farcasterUrl, setFarcasterUrl] = useState<string>("https://farcaster.xyz/~/compose?text=Hello%20world!&embeds[]=https://farcaster.xyz");

  const openFarcasterUrl = useCallback((): void => {
    sdk.actions.openUrl(farcasterUrl);
  }, [farcasterUrl]);

  return (
    <div className="mb-4">
      <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg my-2">
        <pre className="font-mono text-xs text-emerald-500 dark:text-emerald-400">sdk.actions.openUrl</pre>
      </div>
      <div className="mb-2">
        <input
          type="text"
          value={farcasterUrl}
          onChange={(e) => setFarcasterUrl(e.target.value)}
          className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 text-emerald-500 dark:text-emerald-400"
          placeholder="Enter Farcaster URL to open"
        />
      </div>
      <Button onClick={openFarcasterUrl}>Open Farcaster URL</Button>
    </div>
  );
} 