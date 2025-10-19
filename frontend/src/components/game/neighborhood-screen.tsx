"use client";

import React, { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { useFrameContext } from "../providers/frame-provider";
import { Name } from "@coinbase/onchainkit/identity";
import VisitDialog from "./visit-dialog";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { base } from "viem/chains";

interface Player {
  fid: number;
  address: string;
  username: string;
  avatar_url: string;
  created_at: string;
  ensName?: string;
}

interface NeighborhoodScreenProps {
  onBack?: () => void;
}

export default function NeighborhoodScreen({
  onBack,
}: NeighborhoodScreenProps) {
  const frameContext = useFrameContext();
  const searchParams = useSearchParams();
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = (frameContext?.context as any)?.user ?? null;
  const currentFid = user?.fid ?? -1;

  // Get FID filter from URL params
  const fidParam = searchParams.get("fid");
  const allowedFids = fidParam
    ? fidParam
        .split(",")
        .map((f) => parseInt(f.trim()))
        .filter((f) => !isNaN(f))
    : null;

  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(0);
  const housesPerPage = 2; // Show 2 houses per page
  const [houseImages, setHouseImages] = useState<string[]>([]);
  const [isShuffling, setIsShuffling] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isSubmittingVisit, setIsSubmittingVisit] = useState(false);

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
          // Filter out current user only if not in private neighborhood
          let otherPlayers =
            allowedFids && allowedFids.length > 0
              ? data.players.filter((player: Player) =>
                  allowedFids.includes(player.fid)
                )
              : data.players.filter(
                  (player: Player) => player.fid !== currentFid
                );

          setPlayers(otherPlayers);
          setCurrentPage(0); // Reset to first page when new data loads
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
    setSelectedPlayer(player);
  };

  const handleVisit = async (message: string) => {
    if (!selectedPlayer) return;

    setIsSubmittingVisit(true);
    try {
      const response = await fetch("/api/visits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          visitorFid: currentFid,
          homeownerFid: selectedPlayer.fid,
          message: message,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to record visit");
      }

      const result = await response.json();
      console.log("Visit recorded successfully:", result);
      toast.success("Visit recorded successfully! 🎃");

      // Close dialog and show success
      setSelectedPlayer(null);
    } catch (error) {
      console.error("Failed to record visit:", error);
      toast.error(
        "Failed to record visit: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    } finally {
      setIsSubmittingVisit(false);
    }
  };

  const handleCloseDialog = () => {
    setSelectedPlayer(null);
  };

  // Pagination logic
  const totalPages = Math.ceil(players.length / housesPerPage);
  const startIndex = currentPage * housesPerPage;
  const endIndex = startIndex + housesPerPage;
  const currentPlayers = players.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
    shuffleHouseImages(); // Shuffle houses when changing pages
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
    shuffleHouseImages(); // Shuffle houses when changing pages
  };

  // Shuffle house images function
  const shuffleHouseImages = () => {
    setIsShuffling(true);
    const houses = ["/game/house1.png", "/game/house2.png", "/game/house3.png"];
    const shuffled = [...houses].sort(() => Math.random() - 0.5);
    setHouseImages(shuffled);

    // Reset shuffling state after a short delay
    setTimeout(() => {
      setIsShuffling(false);
    }, 300);
  };

  // Initialize house images on component mount
  useEffect(() => {
    shuffleHouseImages();
  }, []);

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
        <Button onClick={onBack ?? (() => {})} variant="secondary">
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
      <div className="relative z-20 p-4 pt-6">
        <div className="flex justify-between items-center mb-4">
          <h1
            className="pixel-font text-2xl"
            style={{ color: "var(--foreground)" }}
          >
            Trick or TrETH
          </h1>
          {onBack && (
            <Button onClick={onBack} variant="secondary">
              Back Home
            </Button>
          )}
        </div>
        {/* Navigation Arrows */}
        {totalPages > 1 && (
          <div className="absolute flex items-center justify-center gap-4">
            <Button
              onClick={handlePreviousPage}
              disabled={currentPage === 0}
              variant="secondary"
              className="pixel-font w-fit text-sm items-center"
            >
              ← Previous
            </Button>

            <div className="pixel-font px-3 py-1 rounded bg-muted text-foreground">
              Street {currentPage + 1} of {totalPages}
            </div>

            <Button
              onClick={handleNextPage}
              disabled={currentPage >= totalPages - 1}
              variant="secondary"
              className="pixel-font w-fit text-sm items-center"
            >
              Next →
            </Button>
          </div>
        )}
      </div>

      {/* Houses Container */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 mt-[22vh] md:mt-0">
        <div className="grid grid-cols-2 gap-x-16 max-w-4xl md:gap-x-48 md:max-w-none">
          {/* House 1 */}
          <div className="relative">
            <button
              onClick={() =>
                currentPlayers[0] && handleHouseClick(currentPlayers[0])
              }
              className="relative group"
              disabled={!currentPlayers[0]}
            >
              <img
                src={houseImages[0] || "/game/house1.png"}
                alt="House 1"
                className={`size-32 object-contain transition-all duration-300 group-hover:scale-105 md:size-64 ${
                  isShuffling ? "opacity-50 scale-95" : "opacity-100 scale-100"
                }`}
                style={{ imageRendering: "pixelated" }}
              />

              {/* Player Info Overlay */}
              {currentPlayers[0] && (
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-center">
                  <div
                    className="pixel-font text-xs px-2 py-1 rounded"
                    style={{
                      backgroundColor: "var(--muted)",
                      color: "var(--foreground)",
                    }}
                  >
                    <Name
                      address={currentPlayers[0].address as `0x${string}`}
                      chain={base}
                    />
                  </div>

                  {/* Avatar */}
                  {currentPlayers[0].avatar_url && (
                    <img
                      src={currentPlayers[0].avatar_url}
                      alt={`${currentPlayers[0].username}'s avatar`}
                      className="w-16 mx-auto mt-1 border-2 rounded md:w-36 border-primary"
                      style={{
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
              onClick={() =>
                currentPlayers[1] && handleHouseClick(currentPlayers[1])
              }
              className="relative group"
              disabled={!currentPlayers[1]}
            >
              <img
                src={houseImages[1] || "/game/house2.png"}
                alt="House 2"
                className={`size-32 object-contain transition-all duration-300 group-hover:scale-105 md:size-64 ${
                  isShuffling ? "opacity-50 scale-95" : "opacity-100 scale-100"
                }`}
                style={{ imageRendering: "pixelated" }}
              />

              {/* Player Info Overlay */}
              {currentPlayers[1] && (
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-center">
                  <div
                    className="pixel-font text-xs px-2 py-1 rounded"
                    style={{
                      backgroundColor: "var(--muted)",
                      color: "var(--foreground)",
                    }}
                  >
                    <Name
                      address={currentPlayers[1].address as `0x${string}`}
                    />
                  </div>

                  {/* Avatar */}
                  {currentPlayers[1].avatar_url && (
                    <img
                      src={currentPlayers[1].avatar_url}
                      alt={`${currentPlayers[1].username}'s avatar`}
                      className="w-16 mx-auto mt-1 border-2 rounded md:w-36"
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
          <p>
            {!allowedFids
              ? "Showing " +
                currentPlayers.length +
                " of " +
                players.length +
                " players"
              : "Showing your private neighborhood"}
          </p>
        </div>
      </div>

      {/* Visit Dialog */}
      {selectedPlayer && (
        <VisitDialog
          player={selectedPlayer}
          onClose={handleCloseDialog}
          onVisit={handleVisit}
          isSubmitting={isSubmittingVisit}
        />
      )}
    </div>
  );
}
