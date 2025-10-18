import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "~/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    // Fetch all players with their avatars
    const { data: players, error } = await supabaseAdmin
      .from("players")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to fetch players" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      players: players || [],
    });
  } catch (error) {
    console.error("Players fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
