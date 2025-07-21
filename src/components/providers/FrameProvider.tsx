'use client'

import { Context, sdk } from "@farcaster/frame-sdk";
import { createContext, useContext, useEffect, useState } from "react";

type FrameContextType = {
  context: Context.MiniAppContext | null;
  isInMiniApp: boolean | null;
} | null;

const FrameContext = createContext<FrameContextType>(null);

export const useFrameContext = () => useContext(FrameContext);

export default function FrameProvider({ children }: { children: React.ReactNode }){
  const [frameContext, setFrameContext] = useState<FrameContextType>(null);

  useEffect(() => {
    const init = async () => {
      const context = await sdk.context;
      const isInMiniApp = (await sdk.isInMiniApp()) ?? false;
      setFrameContext({ context, isInMiniApp });
      setTimeout(() => {
        sdk.actions.ready()
      }, 500)
    }
    init()
  }, [])

    return(
        <FrameContext.Provider value={frameContext}>
         {children}
        </FrameContext.Provider>
    )
}