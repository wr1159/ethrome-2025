"use client";

import React, { useState } from "react";
import { Name } from "@coinbase/onchainkit/identity";
import clsx from "clsx";

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

interface VisitorCardProps {
  visitor: Visitor;
  onSwipe: (direction: "left" | "right") => void;
  isProcessing: boolean;
}

export default function VisitorCard({
  visitor,
  onSwipe,
  isProcessing,
}: VisitorCardProps) {
  const [dragStart, setDragStart] = useState<{
    x: number;
    y: number;
    time: number;
  } | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMove, setLastMove] = useState<{
    x: number;
    y: number;
    time: number;
  } | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isProcessing) return;
    const now = Date.now();
    setDragStart({ x: e.clientX, y: e.clientY, time: now });
    setLastMove({ x: e.clientX, y: e.clientY, time: now });
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !dragStart || isProcessing) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    const now = Date.now();

    setDragOffset({ x: deltaX, y: deltaY });
    setLastMove({ x: e.clientX, y: e.clientY, time: now });
  };

  const handleMouseUp = () => {
    if (!isDragging || isProcessing) return;

    // Calculate velocity for momentum-based swiping
    let shouldSwipe = false;
    let swipeDirection: "left" | "right" | null = null;

    if (lastMove && dragStart) {
      const timeDelta = lastMove.time - dragStart.time;
      const velocity = Math.abs(dragOffset.x) / Math.max(timeDelta, 1);

      // Swipe if either distance threshold OR velocity threshold is met
      const distanceThreshold = 80;
      const velocityThreshold = 0.5; // pixels per ms

      if (
        Math.abs(dragOffset.x) > distanceThreshold ||
        velocity > velocityThreshold
      ) {
        shouldSwipe = true;
        swipeDirection = dragOffset.x > 0 ? "right" : "left";
      }
    }

    if (shouldSwipe && swipeDirection) {
      onSwipe(swipeDirection);
    }

    setDragStart(null);
    setLastMove(null);
    setDragOffset({ x: 0, y: 0 });
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isProcessing) return;
    const touch = e.touches[0];
    const now = Date.now();
    setDragStart({ x: touch.clientX, y: touch.clientY, time: now });
    setLastMove({ x: touch.clientX, y: touch.clientY, time: now });
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !dragStart || isProcessing) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - dragStart.x;
    const deltaY = touch.clientY - dragStart.y;
    const now = Date.now();

    setDragOffset({ x: deltaX, y: deltaY });
    setLastMove({ x: touch.clientX, y: touch.clientY, time: now });
  };

  const handleTouchEnd = () => {
    if (!isDragging || isProcessing) return;

    // Calculate velocity for momentum-based swiping
    let shouldSwipe = false;
    let swipeDirection: "left" | "right" | null = null;

    if (lastMove && dragStart) {
      const timeDelta = lastMove.time - dragStart.time;
      const velocity = Math.abs(dragOffset.x) / Math.max(timeDelta, 1);

      // Swipe if either distance threshold OR velocity threshold is met
      const distanceThreshold = 80;
      const velocityThreshold = 0.5; // pixels per ms

      if (
        Math.abs(dragOffset.x) > distanceThreshold ||
        velocity > velocityThreshold
      ) {
        shouldSwipe = true;
        swipeDirection = dragOffset.x > 0 ? "right" : "left";
      }
    }

    if (shouldSwipe && swipeDirection) {
      onSwipe(swipeDirection);
    }

    setDragStart(null);
    setLastMove(null);
    setDragOffset({ x: 0, y: 0 });
    setIsDragging(false);
  };

  const rotation = dragOffset.x * 0.1;
  const opacity = isDragging ? 0.9 : 1;
  const scale = isDragging ? 1.02 : 1;

  // Add resistance when dragging far
  const resistance = Math.min(Math.abs(dragOffset.x) / 200, 1);
  const resistanceMultiplier = 1 - resistance * 0.3;

  return (
    <div
      className="relative w-full max-w-sm mx-auto"
      style={{ aspectRatio: "3/4" }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="w-full h-full border-2 rounded-lg p-6 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing border-primary bg-muted"
        style={{
          transform: `translate(${dragOffset.x * resistanceMultiplier}px, ${dragOffset.y * resistanceMultiplier}px) rotate(${rotation}deg) scale(${scale})`,
          opacity,
          transition: isDragging ? "none" : "all 0.3s ease-out",
          boxShadow: isDragging
            ? `0 ${Math.abs(dragOffset.y) + 10}px ${Math.abs(dragOffset.x) + 20}px rgba(0, 0, 0, 0.3)`
            : "0 4px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        {/* Visitor Avatar */}
        {visitor.visitor.avatar_url && (
          <img
            src={visitor.visitor.avatar_url}
            alt={`${visitor.visitor.username}'s avatar`}
            className="w-24 h-24 mb-4 border-2 rounded border-primary"
            style={{ imageRendering: "pixelated" }}
          />
        )}

        {/* Visitor Info */}
        <div className="text-center mb-4">
          <h3 className="pixel-font text-lg mb-2 text-foreground">
            {visitor.visitor.username}
          </h3>
          <div className="pixel-font text-sm mb-2 text-muted-foreground">
            <Name address={visitor.visitor.address as `0x${string}`} />
          </div>
        </div>

        {/* Message */}
        <div className="w-full p-4 rounded border-2 border-border bg-background">
          <div className="pixel-font text-sm text-center text-foreground">
            &quot;{visitor.message}&quot;
          </div>
        </div>

        {/* Swipe Indicators */}
        {isDragging && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {dragOffset.x > 30 && (
              <div
                className="pixel-font text-2xl font-bold text-primary transition-all duration-200"
                style={{
                  opacity: Math.min(Math.abs(dragOffset.x) / 100, 1),
                  transform: `scale(${Math.min(Math.abs(dragOffset.x) / 100, 1.2)})`,
                }}
              >
                🎃 TrETH
              </div>
            )}
            {dragOffset.x < -30 && (
              <div
                className="pixel-font text-2xl font-bold text-destructive transition-all duration-200"
                style={{
                  opacity: Math.min(Math.abs(dragOffset.x) / 100, 1),
                  transform: `scale(${Math.min(Math.abs(dragOffset.x) / 100, 1.2)})`,
                }}
              >
                👻 Trick
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
