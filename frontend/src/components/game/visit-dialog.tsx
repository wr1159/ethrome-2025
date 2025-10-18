"use client";

import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "../ui/input";

interface Player {
  fid: number;
  address: string;
  username: string;
  avatar_url: string;
  created_at: string;
  ensName?: string;
}

interface VisitDialogProps {
  player: Player;
  onClose: () => void;
  onVisit: (message: string) => void;
  isSubmitting?: boolean;
}

export default function VisitDialog({
  player,
  onClose,
  onVisit,
  isSubmitting = false,
}: VisitDialogProps) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      setError("Please enter a one-liner!");
      return;
    }

    if (message.length > 100) {
      setError("One-liner must be 100 characters or less!");
      return;
    }

    setError("");
    onVisit(message.trim());
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-background border-2 rounded-lg p-6 max-w-md w-full mx-4 border-primary ">
        <div className="text-center mb-4">
          <h2 className="pixel-font text-xl mb-2 text-foreground">
            Visit {player.username}
          </h2>
          <div className="flex items-center justify-center gap-2 mb-4">
            {player.avatar_url && (
              <img
                src={player.avatar_url}
                alt={`${player.username}'s avatar`}
                className="w-8 h-8 border-2 rounded border-primary"
                style={{
                  imageRendering: "pixelated",
                }}
              />
            )}
            <span className="pixel-font text-sm text-muted-foreground">
              {player.address?.slice(0, 6)}...{player.address?.slice(-4)}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="pixel-font block mb-2 text-foreground">
              Leave a one-liner:
            </label>
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your spooky one-liner..."
              className="w-full p-3 border-2 rounded pixel-font bg-muted border-border text-foreground"
              maxLength={100}
              disabled={isSubmitting}
            />
            <div className="pixel-font text-xs mt-1 text-muted-foreground">
              {message.length}/100 characters
            </div>
          </div>

          {error && (
            <div className="pixel-font text-xs p-2 rounded bg-destructive text-destructive-foreground">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button
              type="button"
              onClick={onClose}
              variant="secondary"
              className="flex-1 pixel-font text-sm"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 pixel-font text-sm"
              disabled={isSubmitting || !message.trim()}
            >
              {isSubmitting ? "Visiting..." : "Visit House"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
