"use client";

import { useState, useCallback } from "react";
import { createAppClient, generateNonce, viemConnector } from "@farcaster/auth-client";
import { Button } from "~/components/ui/Button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

export function ManualSignInAction() {
  const [message, setMessage] = useState<string>("");
  const [signature, setSignature] = useState<string>("");
  const [verifying, setVerifying] = useState<boolean>(false);
  const [verifyResponse, setVerifyResponse] = useState<unknown>(undefined);
  const [verifyParams, setVerifyParams] = useState<unknown>(undefined);
  const [verifyFailure, setVerifyFailure] = useState<string | undefined>(undefined);

  const handleVerify = useCallback(async (): Promise<void> => {
    try {
      setVerifying(true);
      setVerifyFailure(undefined);
      setVerifyResponse(undefined);
      setVerifyParams(undefined);

      const nonce = await generateNonce();
      
      const appClient = createAppClient({
        ethereum: viemConnector(),
      });

      const verifyRequestParams = {
        message: message,
        signature: signature as `0x${string}`,
        domain: new URL(window.location.origin).hostname,
        nonce: nonce,
        acceptAuthAddress: true
      };
      
      setVerifyParams(verifyRequestParams);

      const verifyResult = await appClient.verifySignInMessage(verifyRequestParams);
      setVerifyResponse(verifyResult);

    } catch (error) {
      console.error("Manual verify error:", error);
      setVerifyFailure(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setVerifying(false);
    }
  }, [message, signature]);

  const handleClear = useCallback((): void => {
    setMessage("");
    setSignature("");
    setVerifyResponse(undefined);
    setVerifyParams(undefined);
    setVerifyFailure(undefined);
  }, []);

  return (
    <div className="mb-4">
      <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg my-2">
        <pre className="font-mono text-xs text-emerald-500 dark:text-emerald-400">appClient.verifySignInMessage</pre>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="message">Message</Label>
          <Input
            id="message"
            type="text"
            placeholder="Enter SIWE message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="text-emerald-500 dark:text-emerald-400 placeholder:text-emerald-500 dark:placeholder:text-emerald-400"
          />
        </div>
        
        <div>
          <Label htmlFor="signature">Signature</Label>
          <Input
            id="signature"
            type="text"
            placeholder="Enter signature (0x...)"
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
            className="text-emerald-500 dark:text-emerald-400 placeholder:text-emerald-500 dark:placeholder:text-emerald-400"
          />
        </div>
        
        <div className="flex flex-col gap-2">
          <Button 
            onClick={handleVerify} 
            disabled={verifying || !message || !signature}
          >
            Verify Manual Sign-In
          </Button>
          <Button 
            onClick={handleClear}
            disabled={verifying}
          >
            Clear
          </Button>
        </div>
      </div>

      {verifyFailure && !verifying && (
        <div className="my-2 p-2 text-xs overflow-x-scroll bg-gray-100 dark:bg-gray-800 rounded-lg font-mono">
          <div className="font-semibold text-gray-500 dark:text-gray-400 mb-1">Verify Error</div>
          <div className="whitespace-pre text-red-500 dark:text-red-400">{verifyFailure}</div>
        </div>
      )}

      {verifyParams !== undefined && !verifying && (
        <div className="my-2">
          <div className="p-2 text-xs overflow-x-scroll bg-gray-100 dark:bg-gray-800 rounded-lg font-mono">
            <div className="font-semibold text-gray-500 dark:text-gray-400 mb-1">Verify Params</div>
            <div className="whitespace-pre text-emerald-500 dark:text-emerald-400">{verifyParams ? JSON.stringify(verifyParams, null, 2) : 'No data'}</div>
          </div>
        </div>
      )}

      {verifyResponse !== undefined && !verifying && (
        <div className="my-2">
          <div className="p-2 text-xs overflow-x-scroll bg-gray-100 dark:bg-gray-800 rounded-lg font-mono">
            <div className="font-semibold text-gray-500 dark:text-gray-400 mb-1">Verify Response</div>
            <div className="whitespace-pre text-emerald-500 dark:text-emerald-400">{verifyResponse ? JSON.stringify(verifyResponse, null, 2) : 'No data'}</div>
          </div>
        </div>
      )}
    </div>
  );
} 