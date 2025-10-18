import sdk from "@farcaster/miniapp-sdk";
import { Metadata } from "next";
import { useSearchParams } from "next/navigation";
import { env } from "process";
import { useEffect, useState } from "react";
import GameRouter from "~/components/game/game-router";
import { Button } from "~/components/ui/button";
import { GameScreen } from "~/types";

const appUrl = env.NEXT_PUBLIC_URL;

interface Player {
  fid: number;
  username: string;
  address: string;
  avatar_url: string;
  created_at: string;
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const { id } = await params;

  const imageUrl = new URL(`${appUrl}/api/og/${id}`);

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
  const searchParams = useSearchParams();
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fid = searchParams.get("id");

  useEffect(() => {
    if (!fid) {
      setError("No player ID provided");
      setLoading(false);
      return;
    }

    const fetchPlayer = async () => {
      try {
        const response = await fetch(`/api/players`);
        if (!response.ok) {
          throw new Error("Failed to fetch players");
        }

        const data = await response.json();
        const foundPlayer = data.players.find(
          (p: Player) => p.fid === parseInt(fid)
        );

        if (!foundPlayer) {
          throw new Error("Player not found");
        }

        setPlayer(foundPlayer);
      } catch (err) {
        console.error("Error fetching player:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchPlayer();
  }, [fid]);

  const handleVisitHouse = () => {
    sdk.actions.openMiniApp({
      url: `${process.env.NEXT_PUBLIC_URL}/frame?id=${player?.fid as number}`,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="pixel-font text-white text-xl mb-4">Loading...</div>
          <div className="animate-spin h-8 w-8 border-4 border-white border-t-transparent rounded-full mx-auto" />
        </div>
      </div>
    );
  }

  if (error || !player) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="pixel-font text-white text-xl mb-4">
            {error || "Player not found"}
          </div>
          <div className="pixel-font text-gray-400 text-sm">
            This player might not have created an avatar yet.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Player Avatar */}
        {player.avatar_url && (
          <div className="mb-6">
            <img
              src={player.avatar_url}
              alt={`${player.username}'s avatar`}
              className="w-32 h-32 mx-auto rounded-lg border-4 border-orange-500"
              style={{ imageRendering: "pixelated" }}
            />
          </div>
        )}

        {/* Player Info */}
        <div className="mb-6">
          <h1 className="pixel-font text-white text-2xl mb-2">
            {player.username || `Player #${player.fid}`}
          </h1>
          <div className="pixel-font text-gray-400 text-sm mb-4">
            FID: {player.fid}
          </div>
          <div className="pixel-font text-orange-500 text-lg">
            🎃 Trick or TrETH 🎃
          </div>
        </div>

        {/* Call to Action */}
        <div className="mb-6">
          <p className="pixel-font text-white text-sm mb-4">
            Visit their house and leave a spooky message!
          </p>
          <Button
            onClick={handleVisitHouse}
            className="pixel-font bg-orange-500 hover:bg-orange-600 text-black font-bold py-3 px-6 text-lg"
          >
            🏠 Visit House
          </Button>
        </div>

        {/* Game Info */}
        <div className="pixel-font text-gray-400 text-xs">
          <p>Draw your own Halloween avatar</p>
          <p>Visit other players&apos; houses</p>
          <p>Get the most TrETHs to win ETH!</p>
        </div>
      </div>
    </div>
  );
}
