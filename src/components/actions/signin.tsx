"use client";

import { useState, useCallback } from "react";
import { signIn, signOut, getCsrfToken } from "next-auth/react";
import { useSession } from "next-auth/react";
import sdk from "@farcaster/frame-sdk";
import { SignInResult } from "@farcaster/frame-core/dist/actions/signIn";
import { Button } from "~/components/ui/Button";

export function SignInAction() {
  const [signingIn, setSigningIn] = useState<boolean>(false);
  const [signingOut, setSigningOut] = useState<boolean>(false);
  const [signInResult, setSignInResult] = useState<SignInResult | undefined>(undefined);
  const [signInFailure, setSignInFailure] = useState<string | undefined>(undefined);
  const { data: session, status } = useSession();

  const getNonce = useCallback(async (): Promise<string> => {
    const nonce = await getCsrfToken();
    if (!nonce) throw new Error("Unable to generate nonce");
    return nonce;
  }, []);

  const handleSignIn = useCallback(async (): Promise<void> => {
    try {
      setSigningIn(true);
      setSignInFailure(undefined);
      const nonce = await getNonce();
      const result = await sdk.actions.signIn({ nonce });
      setSignInResult(result);
      await signIn("credentials", {
        message: result.message,
        signature: result.signature,
        redirect: false,
      });
    } catch {
      setSignInFailure("Unknown error");
    } finally {
      setSigningIn(false);
    }
  }, [getNonce]);

  const handleSignOut = useCallback(async (): Promise<void> => {
    try {
      setSigningOut(true);
      await signOut({ redirect: false });
      setSignInResult(undefined);
    } finally {
      setSigningOut(false);
    }
  }, []);

  return (
    <div className="mb-4">
      <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg my-2">
        <pre className="font-mono text-xs text-emerald-500 dark:text-emerald-400">sdk.actions.signIn</pre>
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
      {session && (
        <div className="my-2 p-2 text-xs overflow-x-scroll bg-gray-100 dark:bg-gray-800 rounded-lg font-mono">
          <div className="font-semibold text-gray-500 dark:text-gray-400 mb-1">Session</div>
          <div className="whitespace-pre text-emerald-500 dark:text-emerald-400">{JSON.stringify(session, null, 2)}</div>
        </div>
      )}
      {signInFailure && !signingIn && (
        <div className="my-2 p-2 text-xs overflow-x-scroll bg-gray-100 dark:bg-gray-800 rounded-lg font-mono">
          <div className="font-semibold text-gray-500 dark:text-gray-400 mb-1">SIWF Result</div>
          <div className="whitespace-pre text-red-500 dark:text-red-400">{signInFailure}</div>
        </div>
      )}
      {signInResult && !signingIn && (
        <div className="my-2 p-2 text-xs overflow-x-scroll bg-gray-100 dark:bg-gray-800 rounded-lg font-mono">
          <div className="font-semibold text-gray-500 dark:text-gray-400 mb-1">SIWF Result</div>
          <div className="whitespace-pre text-emerald-500 dark:text-emerald-400">{JSON.stringify(signInResult, null, 2)}</div>
        </div>
      )}
    </div>
  );
} 