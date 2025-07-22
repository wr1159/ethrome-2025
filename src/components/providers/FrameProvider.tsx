'use client'

import { sdk } from "@farcaster/miniapp-sdk";
import { createContext, useContext, useEffect, useState } from "react";

interface SafeAreaInsets {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

interface MiniAppClient {
  platformType?: 'web' | 'mobile';
  clientFid: number;
  added: boolean;
  safeAreaInsets?: SafeAreaInsets;
  notificationDetails?: {
    url: string;
    token: string;
  };
}

interface MiniAppContext {
  user: {
    fid: number;
    username?: string;
    displayName?: string;
    pfpUrl?: string;
  };
  location?: Record<string, unknown>;
  client: MiniAppClient;
}

type FrameContextType = {
  context: MiniAppContext | Record<string, unknown> | null;
  isInMiniApp: boolean;
} | null;

const FrameContext = createContext<FrameContextType>(null);

export const useFrameContext = () => useContext(FrameContext);

export default function FrameProvider({ children }: { children: React.ReactNode }){
  const [frameContext, setFrameContext] = useState<FrameContextType>(null);

  useEffect(() => {
    const init = async () => {
      console.log('🚀 FrameProvider init starting...');
      
      try {
        // First get context and call ready
        console.log('⏳ Getting context...');
        const context = await sdk.context;
        console.log('✅ Context received:', context);
        
        console.log('⏳ Calling sdk.actions.ready()...');
        sdk.actions.ready();
        console.log('✅ sdk.actions.ready() called');
        
        // Wait a moment for SDK to fully initialize after ready
        console.log('⏳ Waiting for SDK initialization...');
        await new Promise(resolve => setTimeout(resolve, 100));
        
        console.log('=== isInMiniApp Debug (after ready) ===');
        
        // Test environment detection manually
        const hasReactNativeWebView = !!window.ReactNativeWebView;
        const isIframe = window !== window.parent;
        console.log('Manual environment check:', hasReactNativeWebView || isIframe);
        console.log('window.ReactNativeWebView exists:', hasReactNativeWebView);
        console.log('isIframe:', isIframe);
        console.log('Context available:', !!context);
        console.log('Context:', context);
        
        // Test isInMiniApp with detailed timing
        const start = performance.now();
        const isInMiniApp = await sdk.isInMiniApp();
        const end = performance.now();
        console.log('isInMiniApp result:', isInMiniApp);
        console.log('isInMiniApp took:', end - start, 'ms');
        
        console.log('=========================');
        
        // Set the frame context
        console.log('🎯 Setting frameContext with isInMiniApp:', isInMiniApp);
        setFrameContext({ context, isInMiniApp });
        console.log('✅ FrameProvider init complete!');
        
      } catch (error) {
        console.error('❌ FrameProvider init error:', error);
        // Still set a basic context even if there's an error
        setFrameContext({ 
          context: { error: 'Failed to initialize' }, 
          isInMiniApp: false 
        });
      }
    }
    
    console.log('🎬 Starting FrameProvider initialization...');
    init();
  }, [])

  return(
    <FrameContext.Provider value={frameContext}>
      {children}
    </FrameContext.Provider>
  );
}