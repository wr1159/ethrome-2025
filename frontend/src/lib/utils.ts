import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const METADATA = {
  name: "Trick or TrETH",
  description:
    "A Halloween social game where you create pixel avatars, visit neighbors, and earn ETH rewards!",
  bannerImageUrl: "/hero.png",
  iconImageUrl: "/icon.png",
  // homeUrl: process.env.NEXT_PUBLIC_URL ?? "https://trick-or-treth.vercel.app",
  homeUrl: "https://trick-or-treth.vercel.app",
  splashBackgroundColor: "#FF6B2B", // Halloween orange
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
