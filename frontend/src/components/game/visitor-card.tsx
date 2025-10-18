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
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(
    null
  );
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isProcessing) return;
    setDragStart({ x: e.clientX, y: e.clientY });
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !dragStart || isProcessing) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    setDragOffset({ x: deltaX, y: deltaY });
  };

  const handleMouseUp = () => {
    if (!isDragging || isProcessing) return;

    const threshold = 100;
    if (Math.abs(dragOffset.x) > threshold) {
      onSwipe(dragOffset.x > 0 ? "right" : "left");
    }

    setDragStart(null);
    setDragOffset({ x: 0, y: 0 });
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isProcessing) return;
    const touch = e.touches[0];
    setDragStart({ x: touch.clientX, y: touch.clientY });
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !dragStart || isProcessing) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - dragStart.x;
    const deltaY = touch.clientY - dragStart.y;

    setDragOffset({ x: deltaX, y: deltaY });
  };

  const handleTouchEnd = () => {
    if (!isDragging || isProcessing) return;

    const threshold = 100;
    if (Math.abs(dragOffset.x) > threshold) {
      onSwipe(dragOffset.x > 0 ? "right" : "left");
    }

    setDragStart(null);
    setDragOffset({ x: 0, y: 0 });
    setIsDragging(false);
  };

  const rotation = dragOffset.x * 0.1;
  const opacity = isDragging ? 0.8 : 1;

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
        className={clsx(
          "w-full h-full border-2 rounded-lg p-6 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing",
          `border-primary bg-muted transform transition-all duration-300 ${isDragging ? "none" : "all 0.3s ease-out"}`,
          `opacity-${opacity}`
        )}
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
            "{visitor.message}"
          </div>
        </div>

        {/* Swipe Indicators */}
        {isDragging && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {dragOffset.x > 50 && (
              <div className="pixel-font text-2xl font-bold text-primary">
                🎃 TrETH
              </div>
            )}
            {dragOffset.x < -50 && (
              <div className="pixel-font text-2xl font-bold text-destructive">
                👻 Trick
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
