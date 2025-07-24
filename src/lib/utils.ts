import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export const METADATA = {
  name: "Base App Mini App Demo",
  description: "A demo mini app for testing capabilities in CBW",
  bannerImageUrl: 'https://i.imgur.com/2bsV8mV.png',
  iconImageUrl: 'https://i.imgur.com/brcnijg.png',
  homeUrl: process.env.NEXT_PUBLIC_URL ?? "https://frames-v2-demo-lilac.vercel.app",
  splashBackgroundColor: "#000000"
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
