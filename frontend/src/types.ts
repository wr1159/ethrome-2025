import React from "react";

export type TabType = "actions" | "context" | "wallet";
export type ActionPageType =
  | "list"
  | "signin"
  | "quickauth"
  | "openurl"
  | "openminiapp"
  | "farcaster"
  | "viewprofile"
  | "viewtoken"
  | "swaptoken"
  | "sendtoken"
  | "viewcast"
  | "composecast"
  | "setprimarybutton"
  | "addminiapp"
  | "closeminiapp"
  | "runtime"
  | "requestcameramicrophone"
  | "haptics";
export type WalletPageType = "list" | "basepay" | "wallet";

export interface ActionDefinition {
  id: ActionPageType;
  name: string;
  description: string;
  component: React.ComponentType;
  icon: React.ComponentType<Record<string, unknown>>;
}

export interface WalletActionDefinition {
  id: WalletPageType;
  name: string;
  description: string;
  component: React.ComponentType;
  icon: React.ComponentType<Record<string, unknown>>;
}

// Game Types
export type GameScreen =
  | "home"
  | "neighborhood"
  | "avatar-creator"
  | "leaderboard";

export interface Player {
  fid: number;
  username?: string;
  address?: string;
  tokenId?: number;
  avatarUrl?: string;
  createdAt: string;
}

export interface Visit {
  id: string;
  visitorFid: number;
  homeownerFid: number;
  message: string;
  matched: boolean;
  createdAt: string;
  visitor?: Player;
}

export interface GameState {
  currentScreen: GameScreen;
  user: Player | null;
  hasAvatar: boolean;
  visitors: Visit[];
  players: Player[];
  leaderboard: Player[];
}

export interface PixelColor {
  name: string;
  hex: string;
  value: number;
}

export interface PixelCanvas {
  width: number;
  height: number;
  pixels: number[][];
}
