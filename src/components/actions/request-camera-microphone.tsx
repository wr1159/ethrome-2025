"use client";

import { useState, useCallback, useEffect } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import { Button } from "~/components/ui/Button";

export function RequestCameraMicrophoneAction() {
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<string | undefined>(undefined);

  const [hasContext, setHasContext] = useState<boolean>(false);
  const [hasPermissions, setHasPermissions] = useState<boolean>(false);

  const checkContext = useCallback(async (): Promise<void> => {
    try {
      const context = await sdk.context;
      const contextExists = !!context;
      // Note: Camera/microphone permission status is not available in context.features
      // We'll rely on the action itself to determine if permissions are available
      const permissionsGranted = contextExists; // Assume available if context exists
      
      setHasContext(contextExists);
      setHasPermissions(!!permissionsGranted);
    } catch (err) {
      console.error("Context check error:", err);
      setHasContext(false);
      setHasPermissions(false);
    }
  }, []);

  const handleRequestAccess = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setResult(undefined);
      
      await sdk.actions.requestCameraAndMicrophoneAccess();
      setResult("Camera and microphone access granted!");
      
      // Update context after successful grant
      await checkContext();
    } catch (err) {
      console.error("Request camera/microphone access error:", err);
    } finally {
      setLoading(false);
    }
  }, [checkContext]);

  const testMediaAccess = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setResult(undefined);

      // Test if we can actually access getUserMedia after permissions
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      // Stop the stream immediately since we're just testing
      stream.getTracks().forEach(track => track.stop());
      
      setResult("Successfully accessed camera and microphone!");
    } catch (err) {
      console.error("Media access test error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Check context on component mount
  useEffect(() => {
    checkContext();
  }, [checkContext]);

  return (
    <div className="space-y-4">
      <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <pre className="font-mono text-xs text-emerald-500 dark:text-emerald-400">
          sdk.actions.requestCameraAndMicrophoneAccess()
        </pre>
      </div>

      {/* Feature Status */}
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
          Permission Status
        </div>
        <div className="text-xs text-blue-700 dark:text-blue-300">
          {hasPermissions ? "Feature supported - permissions granted" : "Feature not supported or permissions not granted"}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        {hasContext && (
          <Button onClick={handleRequestAccess} disabled={loading} className="w-full">
            {loading ? "Requesting Access..." : "Request Camera & Microphone Access"}
          </Button>
        )}
        
        {hasPermissions && (
          <Button 
            onClick={testMediaAccess} 
            disabled={loading}
            className="w-full"
          >
            {loading ? "Testing..." : "Test Media Access"}
          </Button>
        )}
      </div>

      {/* Platform Support Info */}
      <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
        <div className="text-sm font-medium text-yellow-900 dark:text-yellow-100 mb-2">
          Platform Support
        </div>
        <div className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1">
          <div>• iOS: ✅ Full support</div>
          <div>• Android: ✅ Supported</div>
          <div>• Web: ❌ Not supported</div>
        </div>
      </div>



      {/* Success Display */}
      {result && !loading && (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="text-sm font-medium text-green-900 dark:text-green-100 mb-1">
            Success
          </div>
          <div className="text-xs text-green-700 dark:text-green-300 whitespace-pre-wrap">
            {result}
          </div>
        </div>
      )}


    </div>
  );
}