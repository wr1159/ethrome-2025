"use client";

import React, { useState } from "react";
import AvatarCreator from "./avatar-creator";
import NeighborhoodScreen from "./neighborhood-screen";
import { GameScreen } from "~/types";
import { Button } from "../ui/button";

interface GameRouterProps {
  currentScreen: GameScreen;
  onScreenChange: (screen: GameScreen) => void;
}

export default function GameRouter({
  currentScreen,
  onScreenChange,
}: GameRouterProps) {
  const [avatarImageData, setAvatarImageData] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string>("");

  const handleAvatarSave = async (imageData: string, avatarUrl?: string) => {
    setIsSaving(true);
    setSaveMessage("Saving your avatar...");

    try {
      setAvatarImageData(imageData);
      setSaveMessage("Avatar saved successfully! 🎃");

      // Show success message for 2 seconds, then go to home
      setTimeout(() => {
        setSaveMessage("");
        onScreenChange("home");
      }, 2000);
    } catch (error) {
      console.error("Failed to save avatar:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to save avatar. Please try again.";
      setSaveMessage(errorMessage);
      setTimeout(() => setSaveMessage(""), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarCancel = () => {
    onScreenChange("home");
  };

  const handleBackToHome = () => {
    onScreenChange("home");
  };

  switch (currentScreen) {
    case "avatar-creator":
      return (
        <AvatarCreator
          onSave={handleAvatarSave}
          onCancel={handleAvatarCancel}
          isSaving={isSaving}
        />
      );
    case "home":
      return (
        <div
          className="flex flex-col items-center justify-center min-h-screen"
          style={{ backgroundColor: "var(--background)" }}
        >
          <h1
            className="pixel-font mb-4"
            style={{ color: "var(--foreground)" }}
          >
            Trick or TrETH
          </h1>
          <p
            className="pixel-font mb-8"
            style={{ color: "var(--muted-foreground)", fontSize: "10px" }}
          >
            Welcome to your Halloween neighborhood!
          </p>

          {avatarImageData && (
            <div className="mb-6">
              <p
                className="pixel-font mb-2"
                style={{ color: "var(--foreground)", fontSize: "8px" }}
              >
                Your Avatar:
              </p>
              <img
                src={avatarImageData}
                alt="Your avatar"
                className="border-2 rounded-lg"
                style={{
                  borderColor: "var(--primary)",
                  imageRendering: "pixelated",
                }}
                width="120"
                height="200"
              />
            </div>
          )}

          {saveMessage && (
            <div
              className="mb-4 p-3 rounded-lg"
              style={{
                backgroundColor: "var(--muted)",
                color: "var(--foreground)",
              }}
            >
              <p className="pixel-font" style={{ fontSize: "8px" }}>
                {saveMessage}
              </p>
            </div>
          )}

          <div className="flex gap-4">
            <Button onClick={() => onScreenChange("avatar-creator")}>
              {avatarImageData ? "Edit Avatar" : "Create Avatar"}
            </Button>
            <Button
              onClick={() => onScreenChange("neighborhood")}
              variant="secondary"
            >
              Visit Neighborhood
            </Button>
          </div>
        </div>
      );
    case "neighborhood":
      return <NeighborhoodScreen onBack={handleBackToHome} />;
    default:
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-orange-100">
          <h1 className="text-3xl font-bold text-orange-800 mb-4">
            Trick or TrETH
          </h1>
          <p className="text-lg text-orange-700 mb-8">
            Welcome to your Halloween neighborhood!
          </p>
          <Button onClick={() => onScreenChange("avatar-creator")}>
            Create Avatar
          </Button>
        </div>
      );
  }
}
