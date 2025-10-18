"use client";

import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import { sdk } from "@farcaster/miniapp-sdk";
import { toast } from "sonner";

interface ShareAvatarDialogProps {
  isOpen: boolean;
  onClose: () => void;
  fid: number;
  username: string;
}

export default function ShareAvatarDialog({
  isOpen,
  onClose,
  fid,
  username,
}: ShareAvatarDialogProps) {
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    try {
      setIsSharing(true);

      const frameUrl = `${process.env.NEXT_PUBLIC_URL}/frame?id=${fid}`;
      const castText = `🎃 Just created my Halloween avatar in Trick or TrETH! Visit my house and leave a spooky message! 👻`;

      const result = await sdk.actions.composeCast({
        text: castText,
        embeds: [frameUrl],
      });

      if (result.cast) {
        toast.success("Avatar shared successfully! 🎃");
        onClose();
      }
    } catch (error) {
      console.error("Failed to share avatar:", error);
      toast.error("Failed to share avatar. Please try again.");
    } finally {
      setIsSharing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-background border-2 rounded-lg p-6 max-w-md w-full mx-4 border-primary">
        <div className="text-center mb-4">
          <h2 className="pixel-font text-xl mb-2 text-foreground">
            Share Your Avatar?
          </h2>
          <p className="pixel-font text-sm mb-4 text-muted-foreground">
            Let your friends know you&apos;ve created your Halloween avatar and
            invite them to visit your house!
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={onClose}
            variant="secondary"
            className="flex-1 pixel-font"
            disabled={isSharing}
          >
            Maybe Later
          </Button>
          <Button
            onClick={handleShare}
            className="flex-1 pixel-font"
            disabled={isSharing}
            isLoading={isSharing}
          >
            {isSharing ? "Sharing..." : "Share Avatar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
