"use client";

import React, { useState } from "react";
import AvatarCreator from "./AvatarCreator";
import { GameScreen } from "~/types";

interface GameRouterProps {
  currentScreen: GameScreen;
  onScreenChange: (screen: GameScreen) => void;
}

export default function GameRouter({
  currentScreen,
  onScreenChange,
}: GameRouterProps) {
  const [avatarImageData, setAvatarImageData] = useState<string>("");

  const handleAvatarSave = (imageData: string) => {
    setAvatarImageData(imageData);
    console.log("Avatar saved:", imageData.substring(0, 50) + "...");
    // TODO: Upload to Supabase and mint NFT
    onScreenChange("home");
  };

  const handleAvatarCancel = () => {
    onScreenChange("home");
  };

  switch (currentScreen) {
    case "avatar-creator":
      return (
        <AvatarCreator
          onSave={handleAvatarSave}
          onCancel={handleAvatarCancel}
        />
      );
    case "home":
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-orange-100">
          <h1 className="text-3xl font-bold text-orange-800 mb-4">
            Trick or TrETH
          </h1>
          <p className="text-lg text-orange-700 mb-8">
            Welcome to your Halloween neighborhood!
          </p>
          <button
            onClick={() => onScreenChange("avatar-creator")}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg text-lg font-semibold"
          >
            Create Avatar
          </button>
        </div>
      );
    default:
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-orange-100">
          <h1 className="text-3xl font-bold text-orange-800 mb-4">
            Trick or TrETH
          </h1>
          <p className="text-lg text-orange-700 mb-8">
            Welcome to your Halloween neighborhood!
          </p>
          <button
            onClick={() => onScreenChange("avatar-creator")}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg text-lg font-semibold"
          >
            Create Avatar
          </button>
        </div>
      );
  }
}
