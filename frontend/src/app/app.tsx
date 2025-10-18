"use client";

import React, { useState } from "react";
import GameRouter from "~/components/game/game-router";
import { GameScreen } from "~/types";
import { useAccount } from "wagmi";
import { WalletConnect } from "~/components/wallet/wallet-actions";

export default function App() {
  const { isConnected } = useAccount();
  const [currentScreen, setCurrentScreen] = useState<GameScreen>("home");
  const [showGame, setShowGame] = useState(false);

  if (showGame) {
    return (
      <GameRouter
        currentScreen={currentScreen}
        onScreenChange={setCurrentScreen}
      />
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-orange-100">
      <h1 className="text-4xl font-bold text-orange-800 mb-4 text-center">
        Trick or TrETH
      </h1>
      <p className="text-xl text-orange-700 mb-8 text-center max-w-md">
        A Halloween social game where you create pixel avatars, visit neighbors,
        and earn ETH rewards!
      </p>
      <div className="flex gap-4">
        {isConnected ? (
          <button
            onClick={() => setShowGame(true)}
            className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-lg text-xl font-semibold"
          >
            Start Game
          </button>
        ) : (
          <WalletConnect />
        )}
      </div>
      {/* {!showGame && (
        <div className="mt-8">
          <Demo />
        </div>
      )} */}
    </div>
  );
}
