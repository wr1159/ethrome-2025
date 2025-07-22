"use client";

import { useState, useCallback } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import { Button } from "~/components/ui/Button";

export function QuickAuthAction() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<unknown>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchLoading, setFetchLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGetToken = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const result = await sdk.quickAuth.getToken();
      setToken(result.token);
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleFetch = useCallback(async (): Promise<void> => {
    setFetchLoading(true);
    setError(null);
    try {
      const res = await sdk.quickAuth.fetch('http://localhost:8787/me');
      if (res.ok) {
        setUser(await res.json());
      } else {
        setError(`Fetch failed: ${res.status} ${res.statusText}`);
        setUser(null);
      }
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setUser(null);
    } finally {
      setFetchLoading(false);
    }
  }, []);

  return (
    <div className="mb-4">
      <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg my-2">
        <pre className="font-mono text-xs text-emerald-500 dark:text-emerald-400">sdk.quickAuth.getToken</pre>
      </div>
      <Button onClick={handleGetToken} disabled={loading}>
        Get Token
      </Button>
      {token && (
        <div className="my-2 p-2 text-xs overflow-x-scroll bg-gray-100 dark:bg-gray-800 rounded-lg font-mono">
          <div className="font-semibold text-gray-500 dark:text-gray-400 mb-1">Token</div>
          <div className="whitespace-pre text-emerald-500 dark:text-emerald-400">{token}</div>
        </div>
      )}
      
      <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg my-2">
        <pre className="font-mono text-xs text-emerald-500 dark:text-emerald-400">sdk.quickAuth.fetch</pre>
      </div>
      <Button onClick={handleFetch} disabled={fetchLoading}>
        Fetch
      </Button>
      {user !== null && (
        <div className="my-2 p-2 text-xs overflow-x-scroll bg-gray-100 dark:bg-gray-800 rounded-lg font-mono">
          <div className="font-semibold text-gray-500 dark:text-gray-400 mb-1">User Response</div>
          <div className="whitespace-pre text-emerald-500 dark:text-emerald-400">{JSON.stringify(user, null, 2)}</div>
        </div>
      )}
      {error && (
        <div className="my-2 p-2 text-xs overflow-x-scroll bg-gray-100 dark:bg-gray-800 rounded-lg font-mono">
          <div className="font-semibold text-gray-500 dark:text-gray-400 mb-1">Error</div>
          <div className="whitespace-pre text-red-500 dark:text-red-400">{error}</div>
        </div>
      )}
    </div>
  );
} 