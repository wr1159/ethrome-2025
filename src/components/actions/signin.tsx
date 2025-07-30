"use client";

import { useState, useCallback } from "react";
import { signIn, signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { sdk } from "@farcaster/miniapp-sdk";
import { SignInResult } from "@farcaster/miniapp-core/dist/actions/SignIn";
import { createAppClient, generateNonce, viemConnector } from "@farcaster/auth-client";
import { Button } from "~/components/ui/Button";

export function SignInAction() {
  const [signingIn, setSigningIn] = useState<boolean>(false);
  const [signingOut, setSigningOut] = useState<boolean>(false);
  const [signInResult, setSignInResult] = useState<SignInResult | undefined>(undefined);
  const [signInFailure, setSignInFailure] = useState<string | undefined>(undefined);
  const [verifyResponse, setVerifyResponse] = useState<unknown>(undefined);
  const [verifyParams, setVerifyParams] = useState<unknown>(undefined);
  const { data: session, status } = useSession();

  const getNonce = useCallback(async (): Promise<string> => {
    // const nonce = await getCsrfToken();
    const nonce = await generateNonce();
    if (!nonce) throw new Error("Unable to generate nonce");
    return nonce;
  }, []);

  const handleSignIn = useCallback(async (): Promise<void> => {
    try {
      setSigningIn(true);
      setSignInFailure(undefined);
      setVerifyResponse(undefined);
      setVerifyParams(undefined);
      const nonce = await getNonce();
      const result = await sdk.actions.signIn({ nonce });
      setSignInResult(result);

      // Verify the sign-in message
      const appClient = createAppClient({
        ethereum: viemConnector(),
      });

      const verifyRequestParams = {
        message: result.message,
        signature: result.signature as `0x${string}`,
        domain: new URL(window.location.origin).hostname,
        nonce: nonce,
        acceptAuthAddress: true
      };
      
      // Store params for debugging
      setVerifyParams(verifyRequestParams);

      const verifyResult = await appClient.verifySignInMessage(verifyRequestParams);
      setVerifyResponse(verifyResult);

      await signIn("credentials", {
        message: result.message,
        signature: result.signature,
        redirect: false,
      });
    } catch (error) {
      console.error("Sign in error:", error);
      setSignInFailure(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSigningIn(false);
    }
  }, [getNonce]);

  const handleSignOut = useCallback(async (): Promise<void> => {
    try {
      setSigningOut(true);
      await signOut({ redirect: false });
      setSignInResult(undefined);
      setVerifyResponse(undefined);
      setVerifyParams(undefined);
    } finally {
      setSigningOut(false);
    }
  }, []);

  return (
    <div className="mb-4">
      <div className="p-3 bg-muted border border-border rounded-lg my-2">
        <pre className="font-mono text-xs text-primary font-medium">sdk.actions.signIn</pre>
      </div>
      {status !== "authenticated" && (
        <Button onClick={handleSignIn} disabled={signingIn}>
          Sign In with Farcaster
        </Button>
      )}
      {status === "authenticated" && (
        <Button onClick={handleSignOut} disabled={signingOut}>
          Sign out
        </Button>
      )}
      {signInFailure && !signingIn && (
        <div className="my-2 p-3 text-xs overflow-x-scroll bg-muted border border-border rounded-lg font-mono">
          <div className="font-semibold text-muted-foreground mb-1">SIWF Error</div>
          <div className="whitespace-pre text-destructive">{signInFailure}</div>
        </div>
      )}
      {verifyParams !== undefined && !signingIn && (
        <div className="my-2">
          {session?.user?.fid && (
            <div className="mb-2 p-3 bg-primary/10 rounded border border-primary/20">
              <span className="text-sm font-medium text-primary">User ID: {session.user.fid}</span>
            </div>
          )}
          <div className="p-3 text-xs overflow-x-scroll bg-muted border border-border rounded-lg font-mono">
            <div className="font-semibold text-muted-foreground mb-1">Verify Params</div>
            <div className="whitespace-pre text-primary">{verifyParams ? JSON.stringify(verifyParams, null, 2) : 'No data'}</div>
          </div>
        </div>
      )}
      {verifyResponse !== undefined && !signingIn && (
        <div className="my-2">
          {session?.user?.fid && (
            <div className="mb-2 p-3 bg-primary/10 rounded border border-primary/20">
              <span className="text-sm font-medium text-primary">User ID: {session.user.fid}</span>
            </div>
          )}
          <div className="p-3 text-xs overflow-x-scroll bg-muted border border-border rounded-lg font-mono">
            <div className="font-semibold text-muted-foreground mb-1">Verify Response</div>
            <div className="whitespace-pre text-primary">{verifyResponse ? JSON.stringify(verifyResponse, null, 2) : 'No data'}</div>
          </div>
        </div>
      )}
      {signInResult && !signingIn && (
        <div className="my-2">
          {session?.user?.fid && (
            <div className="mb-2 p-3 bg-primary/10 rounded border border-primary/20">
              <span className="text-sm font-medium text-primary">User ID: {session.user.fid}</span>
            </div>
          )}
          <div className="p-3 text-xs overflow-x-scroll bg-muted border border-border rounded-lg font-mono">
            <div className="font-semibold text-muted-foreground mb-1">SIWF Result</div>
            <div className="whitespace-pre text-primary">{JSON.stringify(signInResult, null, 2)}</div>
          </div>
        </div>
      )}
    </div>
  );
} 