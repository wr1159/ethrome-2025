import { supabaseAdmin } from "../../../../lib/supabase";
import { NextRequest } from "next/server";

// Force dynamic rendering to ensure fresh image generation on each request
export const dynamic = "force-dynamic";

/**
 * GET handler for returning player avatar as PNG
 * @param request - The incoming HTTP request
 * @param params - Route parameters containing the FID
 * @returns Response - The avatar image as PNG or error
 */
export async function GET(
  request: NextRequest,
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
      .select("fid, avatar_url")
      .eq("fid", parseInt(fid))
      .single();

    if (error || !player) {
      return new Response(`Player not found`, {
        status: 404,
      });
    }

    if (!player.avatar_url) {
      return new Response(`Player has no avatar`, {
        status: 404,
      });
    }

    // Fetch the avatar image from Supabase Storage
    const avatarResponse = await fetch(player.avatar_url);

    if (!avatarResponse.ok) {
      return new Response(`Failed to fetch avatar image`, {
        status: 500,
      });
    }

    const imageBuffer = await avatarResponse.arrayBuffer();

    // Return the image as PNG
    return new Response(imageBuffer, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    });
  } catch (e) {
    // Log and handle any errors during image fetching
    console.error("Failed to fetch avatar image:", e);
    return new Response(`Failed to fetch avatar image`, {
      status: 500,
    });
  }
}
