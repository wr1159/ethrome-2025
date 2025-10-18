import { loadGoogleFont, loadImage } from "../../../../lib/og-utils";
import { ImageResponse } from "next/og";
import { supabaseAdmin } from "../../../../lib/supabase";

// Force dynamic rendering to ensure fresh image generation on each request
export const dynamic = "force-dynamic";

// Define the dimensions for the generated OpenGraph image
const size = {
  width: 600,
  height: 400,
};

/**
 * GET handler for generating dynamic OpenGraph images
 * @param request - The incoming HTTP request
 * @param params - Route parameters containing the ID
 * @returns ImageResponse - A dynamically generated image for OpenGraph
 */
export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      fid: string;
    }>;
  }
) {
  try {
    // Extract the FID from the route parameters
    const { fid } = await params;

    // Fetch player data from Supabase
    const { data: player, error } = await supabaseAdmin
      .from("players")
      .select("fid, username, avatar_url, address")
      .eq("fid", parseInt(fid))
      .single();

    if (error || !player) {
      return new Response(`Player not found`, {
        status: 404,
      });
    }

    // Get the application's base URL from environment variables
    const appUrl =
      process.env.NEXT_PUBLIC_URL || "https://trick-or-treth.vercel.app";

    // Load and prepare the custom font
    const fontData = await loadGoogleFont(
      "Press+Start+2P",
      "Trick or TrETH Visit my house in Trick or TrETH"
    );

    // Load player avatar image if available
    let avatarImage = null;
    if (player.avatar_url) {
      try {
        avatarImage = await loadImage(player.avatar_url);
      } catch (error) {
        console.error("Failed to load avatar image:", error);
      }
    }

    // Generate and return the image response with the composed elements
    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
            backgroundColor: "#000",
            backgroundImage:
              "radial-gradient(circle at 25px 25px, lightgray 2%, transparent 0%), radial-gradient(circle at 75px 75px, lightgray 2%, transparent 0%)",
            // backgroundImage: "linear-gradient(45deg, #ff6b2b, #6b2bff)",
            backgroundSize: "100px 100px",
            gap: "20px",
            padding: "40px",
          }}
        >
          {/* Halloween-themed background pattern */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />

          {/* Player Avatar */}
          {avatarImage && (
            <img
              src={`data:image/png;base64,${Buffer.from(avatarImage).toString("base64")}`}
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "20px",
                border: "4px solid #ff6b2b",
                marginBottom: "20px",
                imageRendering: "pixelated",
              }}
            />
          )}

          {/* Game Title */}
          <div
            style={{
              color: "#ffffff",
              fontSize: 32,
              fontFamily: "PressStart2P",
              textAlign: "center",
              marginBottom: "10px",
              textShadow: "2px 2px 0px #000000",
            }}
          >
            Trick or TrETH
          </div>

          {/* Call to Action */}
          <div
            style={{
              color: "#ffffff",
              fontSize: 12,
              fontFamily: "PressStart2P",
              textAlign: "center",
              marginTop: "20px",
              opacity: 0.8,
            }}
          >
            Visit my house in Trick or TrETH!
          </div>
        </div>
      ),
      {
        ...size,
        // Configure the custom font for use in the image
        fonts: [
          {
            name: "PressStart2P",
            data: fontData,
            style: "normal",
          },
        ],
      }
    );
  } catch (e) {
    // Log and handle any errors during image generation
    console.error("Failed to generate OpenGraph image:", e);
    return new Response(`Failed to generate OpenGraph image`, {
      status: 500,
    });
  }
}
