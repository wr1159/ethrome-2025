"use client";

import { useCallback } from "react";
import sdk from "@farcaster/frame-sdk";
import { Button } from "~/components/ui/Button";

export function ComposeCastAction() {
  const composeCast = useCallback((): void => {
    sdk.actions.composeCast({ 
      text: "I just learned how to compose a cast", 
      embeds: ["https://miniapps.farcaster.xyz/docs/sdk/actions/compose-cast"] 
    });
  }, []);

  return (
    <div className="mb-4">
      <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg my-2">
        <pre className="font-mono text-xs text-emerald-500 dark:text-emerald-400">sdk.actions.composeCast</pre>
      </div>
      <Button onClick={composeCast}>Compose Cast</Button>
    </div>
  );
} 