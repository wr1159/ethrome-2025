import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "~/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { imageData, fid } = await request.json();

    if (!imageData || !fid) {
      return NextResponse.json(
        { error: "Missing imageData or fid" },
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

    // Update player record in database
    const { error: dbError } = await supabaseAdmin.from("players").upsert({
      fid: fid,
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
