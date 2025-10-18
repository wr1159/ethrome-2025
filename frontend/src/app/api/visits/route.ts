import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "~/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { visitorFid, homeownerFid, message } = await request.json();

    if (
      visitorFid === undefined ||
      homeownerFid === undefined ||
      message === undefined
    ) {
      console.log("visitorFid", visitorFid);
      console.log("homeownerFid", homeownerFid);
      console.log("message", message);
      return NextResponse.json(
        {
          error: "Missing required fields: visitorFid, homeownerFid, message",
        },
        { status: 400 }
      );
    }

    // Create visit record
    const { data: visit, error: visitError } = await supabaseAdmin
      .from("visits")
      .insert({
        visitor_fid: visitorFid,
        homeowner_fid: homeownerFid,
        message: message,
        matched: false,
        seen: false,
      })
      .select()
      .single();

    if (visitError) {
      console.error("Database error:", visitError);
      return NextResponse.json(
        { error: "Failed to record visit" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      visit: visit,
    });
  } catch (error) {
    console.error("Visit creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const homeownerFid = searchParams.get("homeownerFid");
    if (!homeownerFid) {
      return NextResponse.json(
        { error: "Missing homeownerFid parameter" },
        { status: 400 }
      );
    }

    // Fetch visits for a specific homeowner
    const { data: visits, error } = await supabaseAdmin
      .from("visits")
      .select(
        `
        *,
        visitor:visitor_fid(fid, username, avatar_url, address)
      `
      )
      .eq("seen", false)
      .eq("homeowner_fid", homeownerFid)
      .order("created_at", { ascending: false });

    console.log("visits", visits);
    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to fetch visits" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      visits: visits || [],
    });
  } catch (error) {
    console.error("Visits fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { visitId, matched, seen } = await request.json();

    if (!visitId) {
      return NextResponse.json({ error: "Missing visitId" }, { status: 400 });
    }

    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};
    if (matched !== undefined) updateData.matched = matched;
    if (seen !== undefined) updateData.seen = seen;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    const { data: visit, error } = await supabaseAdmin
      .from("visits")
      .update(updateData)
      .eq("id", visitId)
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to update visit" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      visit: visit,
    });
  } catch (error) {
    console.error("Visit update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
