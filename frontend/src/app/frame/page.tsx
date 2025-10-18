import { Metadata } from "next";
import { env } from "process";
import { useState } from "react";
import GameRouter from "~/components/game/game-router";
import { GameScreen } from "~/types";

const appUrl = env.NEXT_PUBLIC_URL;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const { id } = await params;

  const imageUrl = new URL(`${appUrl}/api/og/example/${id}`);

  const frame = {
    version: "next",
    imageUrl: imageUrl.toString(),
    button: {
      title: "Launch App",
      action: {
        type: "launch_frame",
        name: "Launch App",
        url: appUrl,
        splashImageUrl: `${appUrl}/images/splash.png`,
        splashBackgroundColor: "#000",
      },
    },
  };

  return {
    title: "Trick or TrETH",
    openGraph: {
      title: "Trick or TrETH",
      description: "Put on your best costume!",
      images: [{ url: imageUrl.toString() }],
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  };
}

export default async function FramePage() {
  const [currentScreen, setCurrentScreen] = useState<GameScreen>("home");
  return (
    <GameRouter
      currentScreen={currentScreen}
      onScreenChange={setCurrentScreen}
    />
  );
}
