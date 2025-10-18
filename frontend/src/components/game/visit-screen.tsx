"use client";

import React, { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { useFrameContext } from "../providers/frame-provider";
import VisitorCard from "./visitor-card";
import { toast } from "sonner";

interface Visitor {
  id: string;
  visitor_fid: number;
  homeowner_fid: number;
  message: string;
  matched: boolean;
  seen: boolean;
  created_at: string;
  visitor: {
    fid: number;
    username: string;
    avatar_url: string;
    address: string;
  };
}

interface HomeScreenProps {
  onBack: () => void;
  onVisitNeighborhood: () => void;
}

export default function HomeScreen({
  onBack,
  onVisitNeighborhood,
}: HomeScreenProps) {
  const frameContext = useFrameContext();
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = (frameContext?.context as any)?.user ?? null;
  const currentFid = user?.fid ?? 0;

  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [currentVisitorIndex, setCurrentVisitorIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch visitors on component mount
  useEffect(() => {
    const fetchVisitors = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/visits?homeownerFid=${currentFid}`);
        console.log("response", response);
        if (!response.ok) {
          throw new Error("Failed to fetch visitors");
        }
        const data = await response.json();

        if (data.success) {
          setVisitors(data.visits);
          setCurrentVisitorIndex(0);
        } else {
          throw new Error(data.error || "Failed to fetch visitors");
        }
      } catch (err) {
        console.error("Error fetching visitors:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch visitors"
        );
      } finally {
        setLoading(false);
      }
    };

    if (currentFid !== null) {
      fetchVisitors();
    }
  }, [currentFid]);

  const handleSwipe = async (direction: "left" | "right") => {
    if (currentVisitorIndex >= visitors.length || isProcessing) return;

    const currentVisitor = visitors[currentVisitorIndex];
    setIsProcessing(true);

    try {
      if (direction === "right") {
        // Mark as matched (swipe right = "trETH")
        const response = await fetch("/api/visits", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            visitId: currentVisitor.id,
            matched: true,
            seen: true,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to record match");
        }

        console.log("Match recorded successfully!");
        toast.success("Success! 🎃");
      } else {
        // Mark as seen but not matched (swipe left = decline)
        const response = await fetch("/api/visits", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            visitId: currentVisitor.id,
            seen: true,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to record decline");
        }

        console.log("Visit declined");
        toast.warning("Visit declined successfully! 🎃");
      }

      // Move to next visitor
      setCurrentVisitorIndex((prev) => prev + 1);
    } catch (error) {
      console.error("Failed to process swipe:", error);
      toast.error(
        "Failed to process swipe: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const currentVisitor = visitors[currentVisitorIndex];

  if (loading) {
    return (
      <div
        className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden"
        style={{ backgroundColor: "var(--background)" }}
      >
        {/* Door Background */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/game/door_pov.png')",
            backgroundSize: "cover",
          }}
        />

        {/* Content Overlay */}
        <div className="relative z-10 flex flex-col items-center justify-center">
          <h1
            className="pixel-font text-2xl mb-4"
            style={{ color: "var(--foreground)" }}
          >
            Loading Your House...
          </h1>
          <div className="animate-spin h-8 w-8 border-4 border-current border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden"
        style={{ backgroundColor: "var(--background)" }}
      >
        {/* Door Background */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/game/door_pov.png')",
            backgroundSize: "cover",
          }}
        />

        {/* Content Overlay */}
        <div className="relative z-10 flex flex-col items-center justify-center">
          <h1
            className="pixel-font text-2xl mb-4"
            style={{ color: "var(--foreground)" }}
          >
            Error
          </h1>
          <div
            className="pixel-font mb-4"
            style={{ color: "var(--destructive)" }}
          >
            {error}
          </div>
          <Button onClick={onBack} variant="secondary">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (visitors.length === 0) {
    return (
      <div
        className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden"
        style={{ backgroundColor: "var(--background)" }}
      >
        {/* Door Background */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/game/door_pov.png')",
            backgroundSize: "cover",
          }}
        />

        {/* Content Overlay */}
        <div className="relative z-10 flex flex-col items-center justify-center">
          <h1
            className="pixel-font text-2xl mb-4"
            style={{ color: "var(--foreground)" }}
          >
            Your House
          </h1>
          <div
            className="pixel-font mb-8 text-center max-w-md"
            style={{ color: "var(--muted-foreground)" }}
          >
            <p>No visitors yet!</p>
            <p>Go visit your neighbors to get some visitors.</p>
          </div>
          <div className="flex gap-4">
            <Button onClick={onBack} variant="secondary">
              Back Home
            </Button>
            <Button onClick={onVisitNeighborhood}>Visit Neighborhood</Button>
          </div>
        </div>
      </div>
    );
  }

  if (currentVisitorIndex >= visitors.length) {
    return (
      <div
        className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden"
        style={{ backgroundColor: "var(--background)" }}
      >
        {/* Door Background */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/game/door_pov.png')",
            backgroundSize: "cover",
          }}
        />

        {/* Content Overlay */}
        <div className="relative z-10 flex flex-col items-center justify-center">
          <h1
            className="pixel-font text-2xl mb-4"
            style={{ color: "var(--foreground)" }}
          >
            All Caught Up!
          </h1>
          <div
            className="pixel-font mb-8 text-center max-w-md"
            style={{ color: "var(--muted-foreground)" }}
          >
            <p>You&apos;ve reviewed all your visitors.</p>
            <p>Go visit more neighbors to get more visitors!</p>
          </div>
          <div className="flex gap-4">
            <Button onClick={onBack} variant="secondary">
              Back Home
            </Button>
            <Button onClick={onVisitNeighborhood}>Visit Neighborhood</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative flex flex-col items-center justify-center min-h-screen p-4 overflow-hidden"
      style={{ backgroundColor: "var(--background)" }}
    >
      {/* Door Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/game/door_pov.png')",
          backgroundSize: "cover",
        }}
      />

      {/* Content Overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1
            className="pixel-font text-2xl mb-2"
            style={{ color: "var(--foreground)" }}
          >
            Your House
          </h1>
          <div
            className="pixel-font text-sm"
            style={{ color: "var(--muted-foreground)" }}
          >
            {currentVisitorIndex + 1} of {visitors.length} visitors
          </div>
        </div>

        {/* Visitor Card */}
        <div className="mb-8">
          <VisitorCard
            visitor={currentVisitor}
            onSwipe={handleSwipe}
            isProcessing={isProcessing}
          />
        </div>

        {/* Swipe Instructions */}
        <div
          className="pixel-font text-center mb-6"
          style={{ color: "var(--muted-foreground)", fontSize: "10px" }}
        >
          <p>Swipe right to &quot;TrETH&quot; (accept) or left to decline</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-6">
          <Button
            onClick={() => handleSwipe("left")}
            variant="destructive"
            disabled={isProcessing}
            className="pixel-font"
            style={{ fontSize: "12px" }}
          >
            👻 Decline
          </Button>
          <Button
            onClick={() => handleSwipe("right")}
            disabled={isProcessing}
            className="pixel-font"
            style={{ fontSize: "12px" }}
          >
            🎃 TrETH
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex gap-4">
          <Button onClick={onBack} variant="secondary" className="pixel-font">
            Exit House
          </Button>
          <Button onClick={onVisitNeighborhood} className="pixel-font">
            Visit Neighborhood
          </Button>
        </div>
      </div>
    </div>
  );
}
