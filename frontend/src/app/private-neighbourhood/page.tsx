import { Metadata } from "next";
import NeighborhoodScreen from "~/components/game/neighborhood-screen";
import { METADATA } from "~/lib/utils";

const ROOT_URL =
  process.env.NEXT_PUBLIC_URL || "https://trick-or-treth.vercel.app";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const fidParam = params.fid as string;

  // Create the URL with FID parameters
  const urlWithParams = fidParam ? `${ROOT_URL}/?fid=${fidParam}` : ROOT_URL;

  const frame = {
    version: "next",
    imageUrl: METADATA.bannerImageUrl,
    button: {
      title: "Visit Your Private Neighborhood",
      action: {
        type: "launch_frame",
        name: "Launch App",
        url: urlWithParams,
        splashImageUrl: `${ROOT_URL}/splash.png`,
        splashBackgroundColor: "#000",
      },
    },
  };

  return {
    title: "Trick or TrETH - Private Neighborhood",
    openGraph: {
      title: "Trick or TrETH - Private Neighborhood",
      description: "Visit your private neighborhood in Trick or TrETH!",
      images: [{ url: METADATA.bannerImageUrl }],
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  };
}

export default function PrivateNeighbourhoodPage() {
  return <NeighborhoodScreen />;
}
