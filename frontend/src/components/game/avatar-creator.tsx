"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { Button } from "~/components/ui/button";
import { PixelColor, PixelCanvas } from "~/types";

// Primary paint colors using CSS variables
const PIXEL_COLORS: PixelColor[] = [
  { name: "Orange", hex: "#FF6B2B", value: 1 },
  { name: "Black", hex: "#000000", value: 2 },
  { name: "Purple", hex: "#6B2BFF", value: 3 },
  { name: "White", hex: "#FFFFFF", value: 4 },
  { name: "Green", hex: "#00FF00", value: 5 },
  { name: "Red", hex: "#FF0000", value: 6 },
  { name: "Yellow", hex: "#FFFF00", value: 7 },
  { name: "Brown", hex: "#8B4513", value: 8 },
  { name: "Gray", hex: "#808080", value: 9 },
  { name: "Dark Purple", hex: "#4B0082", value: 10 },
];

const CANVAS_WIDTH = 30;
const CANVAS_HEIGHT = 50;
const PIXEL_SIZE = 10; // Size of each pixel in the display

interface AvatarCreatorProps {
  onSave: (imageData: string) => void;
  onCancel: () => void;
}

export default function AvatarCreator({
  onSave,
  onCancel,
}: AvatarCreatorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedColor, setSelectedColor] = useState<PixelColor>(
    PIXEL_COLORS[0]
  );
  const [pixels, setPixels] = useState<number[][]>(() =>
    Array(CANVAS_HEIGHT)
      .fill(null)
      .map(() => Array(CANVAS_WIDTH).fill(0))
  );
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<"draw" | "erase">("draw");

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = CANVAS_WIDTH * PIXEL_SIZE;
    canvas.height = CANVAS_HEIGHT * PIXEL_SIZE;

    // Draw grid
    drawPixels();
  }, [pixels]);

  const drawPixels = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw pixels
    for (let y = 0; y < CANVAS_HEIGHT; y++) {
      for (let x = 0; x < CANVAS_WIDTH; x++) {
        const colorValue = pixels[y][x];
        if (colorValue > 0) {
          const color = PIXEL_COLORS.find((c) => c.value === colorValue);
          if (color) {
            ctx.fillStyle = color.hex;
            ctx.fillRect(
              x * PIXEL_SIZE,
              y * PIXEL_SIZE,
              PIXEL_SIZE,
              PIXEL_SIZE
            );
          }
        }
      }
    }

    // Draw grid lines
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= CANVAS_WIDTH; x++) {
      ctx.beginPath();
      ctx.moveTo(x * PIXEL_SIZE, 0);
      ctx.lineTo(x * PIXEL_SIZE, CANVAS_HEIGHT * PIXEL_SIZE);
      ctx.stroke();
    }
    for (let y = 0; y <= CANVAS_HEIGHT; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * PIXEL_SIZE);
      ctx.lineTo(CANVAS_WIDTH * PIXEL_SIZE, y * PIXEL_SIZE);
      ctx.stroke();
    }
  }, [pixels]);

  const getMousePosition = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: -1, y: -1 };

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / PIXEL_SIZE);
    const y = Math.floor((e.clientY - rect.top) / PIXEL_SIZE);

    return { x, y };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const { x, y } = getMousePosition(e);
    if (x >= 0 && x < CANVAS_WIDTH && y >= 0 && y < CANVAS_HEIGHT) {
      drawPixel(x, y);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const { x, y } = getMousePosition(e);
    if (x >= 0 && x < CANVAS_WIDTH && y >= 0 && y < CANVAS_HEIGHT) {
      drawPixel(x, y);
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const drawPixel = (x: number, y: number) => {
    setPixels((prev) => {
      const newPixels = prev.map((row) => [...row]);
      if (tool === "draw") {
        newPixels[y][x] = selectedColor.value;
      } else if (tool === "erase") {
        newPixels[y][x] = 0;
      }
      return newPixels;
    });
  };

  const clearCanvas = () => {
    setPixels(
      Array(CANVAS_HEIGHT)
        .fill(null)
        .map(() => Array(CANVAS_WIDTH).fill(0))
    );
  };

  const exportImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return "";

    // Create a new canvas for export (without grid)
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = CANVAS_WIDTH;
    exportCanvas.height = CANVAS_HEIGHT;
    const ctx = exportCanvas.getContext("2d");

    if (!ctx) return "";

    // Draw pixels without grid
    for (let y = 0; y < CANVAS_HEIGHT; y++) {
      for (let x = 0; x < CANVAS_WIDTH; x++) {
        const colorValue = pixels[y][x];
        if (colorValue > 0) {
          const color = PIXEL_COLORS.find((c) => c.value === colorValue);
          if (color) {
            ctx.fillStyle = color.hex;
            ctx.fillRect(x, y, 1, 1);
          }
        }
      }
    }

    return exportCanvas.toDataURL("image/png");
  };

  const handleSave = () => {
    const imageData = exportImage();
    onSave(imageData);
  };

  return (
    <div
      className="flex flex-col items-center p-4 min-h-screen"
      style={{ backgroundColor: "var(--background)" }}
    >
      <h1 className="pixel-font mb-4" style={{ color: "var(--foreground)" }}>
        Create Your Avatar
      </h1>

      {/* Canvas */}
      <div
        className="mb-4 border-2 rounded-lg overflow-hidden"
        style={{ borderColor: "var(--primary)" }}
      >
        <canvas
          ref={canvasRef}
          className="cursor-crosshair"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>

      {/* Color Palette */}
      <div className="mb-4">
        <h3 className="pixel-font mb-2" style={{ color: "var(--foreground)" }}>
          Colors
        </h3>
        <div className="flex flex-wrap gap-2 justify-center">
          {PIXEL_COLORS.map((color) => (
            <button
              key={color.value}
              className={`w-8 h-8 rounded border-2 ${
                selectedColor.value === color.value
                  ? "border-black scale-110"
                  : "border-gray-300"
              }`}
              style={{ backgroundColor: color.hex }}
              onClick={() => setSelectedColor(color)}
              title={color.name}
            />
          ))}
        </div>
      </div>

      {/* Tools */}
      <div className="mb-4">
        <h3 className="pixel-font mb-2" style={{ color: "var(--foreground)" }}>
          Tools
        </h3>
        <div className="flex gap-2">
          <Button
            variant={tool === "draw" ? "default" : "secondary"}
            onClick={() => setTool("draw")}
          >
            Draw
          </Button>
          <Button
            variant={tool === "erase" ? "default" : "secondary"}
            onClick={() => setTool("erase")}
          >
            Erase
          </Button>
          <Button variant="destructive" onClick={clearCanvas}>
            Clear
          </Button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Button onClick={handleSave} variant="default">
          Save Avatar
        </Button>
        <Button onClick={onCancel} variant="secondary">
          Cancel
        </Button>
      </div>

      {/* Instructions */}
      <div
        className="mt-4 pixel-font text-center max-w-md"
        style={{ color: "var(--muted-foreground)", fontSize: "8px" }}
      >
        <p>• Click and drag to draw pixels</p>
        <p>• Select a color from the palette</p>
        <p>• Use Erase tool to remove pixels</p>
        <p>• Create your unique Halloween avatar!</p>
      </div>
    </div>
  );
}
