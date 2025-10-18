import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "~/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { imageData, fid, address, username } = await request.json();

    if (!imageData || !fid || !address || !username) {
      return NextResponse.json(
        { error: "Missing imageData, fid, address, or username" },
        { status: 400 }
      );
    }

    // Convert base64 to buffer
    const base64Data = imageData.replace(/^data:image\/png;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `avatar_${fid}_${timestamp}.png`;
    console.log("Uploading avatar to Supabase Storage:", filename);

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from("avatars")
      .upload(filename, buffer, {
        contentType: "image/png",
        upsert: false,
      });

    if (error) {
      console.error("Supabase upload error:", error);
      return NextResponse.json(
        { error: "Failed to upload avatar" },
        { status: 500 }
      );
    }
    console.log("Avatar uploaded to Supabase Storage:", data);

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from("avatars")
      .getPublicUrl(filename);

    if (!urlData.publicUrl) {
      return NextResponse.json(
        { error: "Failed to get public URL" },
        { status: 500 }
      );
    }

    // If the player already exists, update the avatar_url
    const { data: player, error: playerError } = await supabaseAdmin
      .from("players")
      .select("*")
      .eq("fid", fid)
      .single();

    if (player) {
      const { error: dbError } = await supabaseAdmin
        .from("players")
        .update({
          avatar_url: urlData.publicUrl,
        })
        .eq("fid", fid);
      if (dbError) {
        console.error("Database update error:", dbError);
        return NextResponse.json(
          { error: "Failed to update player record" },
          { status: 500 }
        );
      }
      return NextResponse.json({
        success: true,
      });
    }

    // Create in database
    const { error: dbError } = await supabaseAdmin.from("players").upsert({
      fid: fid,
      address: address,
      username: username,
      avatar_url: urlData.publicUrl,
    });

    if (dbError) {
      console.error("Database update error:", dbError);
      return NextResponse.json(
        { error: "Failed to update player record" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      avatarUrl: urlData.publicUrl,
      filename: filename,
    });
  } catch (error) {
    console.error("Avatar upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
