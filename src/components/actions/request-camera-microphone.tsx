"use client";

import { useState, useCallback } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import { Button } from "~/components/ui/Button";

export function RequestCameraMicrophoneAction() {
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);
  const [permissionStatus, setPermissionStatus] = useState<string>("unknown");

  const checkFeatureSupport = useCallback(async (): Promise<void> => {
    try {
      const context = await sdk.context;
      const isSupported = context.features?.cameraAndMicrophoneAccess;
      if (isSupported) {
        setPermissionStatus("Feature supported - permissions granted");
      } else {
        setPermissionStatus("Feature not supported or permissions not granted");
      }
    } catch (err) {
      console.error("Feature check error:", err);
      setPermissionStatus("Error checking feature support");
    }
  }, []);

  const handleRequestAccess = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(undefined);
      setResult(undefined);
      
      await sdk.actions.requestCameraAndMicrophoneAccess();
      setResult("Camera and microphone access granted! You can now use camera/microphone features.");
      
      // Update permission status after successful grant
      await checkFeatureSupport();
    } catch (err) {
      console.error("Request camera/microphone access error:", err);
      if (err instanceof Error) {
        if (err.message.includes('denied') || err.message.includes('NotAllowedError')) {
          setError("Camera and microphone access denied by user");
        } else if (err.message.includes('not supported')) {
          setError("Camera and microphone access is not supported on this platform");
        } else {
          setError(`Error: ${err.message}`);
        }
      } else {
        setError("Unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  }, [checkFeatureSupport]);

  const testMediaAccess = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(undefined);
      setResult(undefined);

      // Test if we can actually access getUserMedia after permissions
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      // Stop the stream immediately since we're just testing
      stream.getTracks().forEach(track => track.stop());
      
      setResult("Successfully accessed camera and microphone! Media stream created and closed.");
    } catch (err) {
      console.error("Media access test error:", err);
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError("Media access denied. Please grant camera and microphone permissions first.");
        } else if (err.name === 'NotFoundError') {
          setError("Camera or microphone not found on this device.");
        } else {
          setError(`Media access error: ${err.message}`);
        }
      } else {
        setError("Unknown media access error");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Check feature support on component mount
  useState(() => {
    checkFeatureSupport();
  });

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
          {permissionStatus}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        <Button onClick={handleRequestAccess} disabled={loading} className="w-full">
          {loading ? "Requesting Access..." : "Request Camera & Microphone Access"}
        </Button>
        
        <Button 
          onClick={testMediaAccess} 
          disabled={loading}
          className="w-full"
        >
          {loading ? "Testing..." : "Test Media Access"}
        </Button>

        <Button 
          onClick={checkFeatureSupport} 
          disabled={loading}
          className="w-full"
        >
          Check Feature Support
        </Button>
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

      {/* Error Display */}
      {error && !loading && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <div className="text-sm font-medium text-red-900 dark:text-red-100 mb-1">
            Error
          </div>
          <div className="text-xs text-red-700 dark:text-red-300 whitespace-pre-wrap">
            {error}
          </div>
        </div>
      )}

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

      {/* Usage Example */}
      <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-800">
        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
          Usage Example
        </div>
        <pre className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap overflow-x-auto">
{`// After permissions are granted:
const stream = await navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
});

// Use stream for video recording, calls, etc.
videoElement.srcObject = stream;`}
        </pre>
      </div>
    </div>
  );
}