import { Metadata } from "next";
import { env } from "process";
import App from "../../app";
import { METADATA } from "~/lib/utils";

const appUrl = env.NEXT_PUBLIC_URL;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ fid: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const { fid } = await params;

  const imageUrl = new URL(`${appUrl}/api/og/${fid}`);

  const frame = {
    version: "next",
    imageUrl: imageUrl.toString(),
    button: {
      title: "Launch App",
      action: {
        type: "launch_frame",
        name: METADATA.name,
        url: METADATA.homeUrl,
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
      "fc:miniapp": JSON.stringify(frame),
    },
  };
}

export default async function FramePage() {
  return <App />;
}
