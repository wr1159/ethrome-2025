"use client";

import React, { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { useAccount, useEnsName } from "wagmi";
import { useFrameContext } from "../providers/frame-provider";
import { truncateAddress } from "~/lib/truncateAddress";
import { Name } from "@coinbase/onchainkit/identity";
import { base } from "wagmi/chains";

interface Player {
  fid: number;
  address: string;
  username: string;
  avatar_url: string;
  created_at: string;
  ensName: string;
}

interface NeighborhoodScreenProps {
  onBack: () => void;
  onVisitPlayer: (player: Player) => void;
}

export default function NeighborhoodScreen({
  onBack,
  onVisitPlayer,
}: NeighborhoodScreenProps) {
  const { address } = useAccount();
  const frameContext = useFrameContext();
  const user = (frameContext?.context as any)?.user ?? null;
  const currentFid = user?.fid ?? -1;

  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  // Fetch players on component mount
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/players");

        if (!response.ok) {
          throw new Error("Failed to fetch players");
        }

        const data = await response.json();

        if (data.success) {
          // Filter out current user
          //   const otherPlayers = data.players.filter(
          //     (player: Player) => player.fid !== currentFid
          //   );
          //   setPlayers(otherPlayers);
          console.log("data.players", data.players);
          setPlayers(data.players);
        } else {
          throw new Error(data.error || "Failed to fetch players");
        }
      } catch (err) {
        console.error("Error fetching players:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch players"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, [currentFid]);

  const handleHouseClick = (player: Player) => {
    onVisitPlayer(player);
  };

  if (loading) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-screen"
        style={{ backgroundColor: "var(--background)" }}
      >
        <div className="pixel-font" style={{ color: "var(--foreground)" }}>
          Loading neighborhood...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-screen"
        style={{ backgroundColor: "var(--background)" }}
      >
        <div
          className="pixel-font mb-4"
          style={{ color: "var(--destructive)" }}
        >
          Error: {error}
        </div>
        <Button onClick={onBack} variant="secondary">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div
      className="relative h-screen overflow-hidden"
      style={{ backgroundColor: "var(--background)" }}
    >
      {/* Background Image */}
      <div
        //   for desktop, make it show only 50% of the  image
        className="absolute inset-0 h-screen bg-cover bg-center bg-no-repeat md:w-screen md:bg-bottom"
        style={{
          backgroundImage: "url('/game/totbg.png')",
          backgroundSize: "cover",
        }}
      />

      {/* Header */}
      <div className="relative z-10 p-4">
        <div className="flex justify-between items-center mb-4">
          <h1
            className="pixel-font text-2xl"
            style={{ color: "var(--foreground)" }}
          >
            Trick or TrETH
          </h1>
          <Button onClick={onBack} variant="secondary">
            Back Home
          </Button>
        </div>
      </div>

      {/* Houses Container */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 mt-[22vh] md:mt-0">
        <div className="grid grid-cols-2 gap-x-16 max-w-4xl md:gap-x-48 md:max-w-none">
          {/* House 1 */}
          <div className="relative">
            <button
              onClick={() => players[0] && handleHouseClick(players[0])}
              className="relative group"
              disabled={!players[0]}
            >
              <img
                src="/game/house1.png"
                alt="House 1"
                className="size-32 object-contain transition-transform group-hover:scale-105 md:size-64"
                style={{ imageRendering: "pixelated" }}
              />

              {/* Player Info Overlay */}
              {players[0] && (
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-center">
                  <div
                    className="pixel-font text-xs px-2 py-1 rounded"
                    style={{
                      backgroundColor: "var(--muted)",
                      color: "var(--foreground)",
                    }}
                  >
                    <Name address={players[0].address as `0x${string}`} />
                  </div>

                  {/* Avatar */}
                  {players[0].avatar_url && (
                    <img
                      src={players[0].avatar_url}
                      alt={`${players[0].username}'s avatar`}
                      className="size-16 mx-auto mt-1 border-2 rounded md:size-36"
                      style={{
                        borderColor: "var(--primary)",
                        imageRendering: "pixelated",
                      }}
                    />
                  )}
                </div>
              )}
            </button>
          </div>

          {/* House 2 */}
          <div className="relative">
            <button
              onClick={() => players[1] && handleHouseClick(players[1])}
              className="relative group"
              disabled={!players[1]}
            >
              <img
                src="/game/house2.png"
                alt="House 2"
                className="size-32 object-contain transition-transform group-hover:scale-105 md:size-64"
                style={{ imageRendering: "pixelated" }}
              />

              {/* Player Info Overlay */}
              {players[1] && (
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-center">
                  <div
                    className="pixel-font text-xs px-2 py-1 rounded"
                    style={{
                      backgroundColor: "var(--muted)",
                      color: "var(--foreground)",
                    }}
                  >
                    <Name address={players[1].address as `0x${string}`} />
                  </div>

                  {/* Avatar */}
                  {players[1].avatar_url && (
                    <img
                      src={players[1].avatar_url}
                      alt={`${players[1].username}'s avatar`}
                      className="size-16 mx-auto mt-1 border-2 rounded md:size-36"
                      style={{
                        borderColor: "var(--primary)",
                        imageRendering: "pixelated",
                      }}
                    />
                  )}
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 pixel-font text-center max-w-md text-primary">
          <p>Click on a house to visit that player!</p>
          <p>Players: {players.length} available</p>
        </div>
      </div>
    </div>
  );
}
