import { NextRequest, NextResponse } from "next/server";
import { getOrganizationRepos } from "@/services/github";
import { ReposResponse, APIError } from "@/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ org: string }> }
): Promise<NextResponse<ReposResponse | APIError>> {
  try {
    const { org } = await params;

    if (!org) {
      return NextResponse.json(
        { error: "Organization name is required" },
        { status: 400 }
      );
    }

    const repos = await getOrganizationRepos(org);

    return NextResponse.json({ repos });
  } catch (error) {
    console.error("Error fetching repos:", error);

    const message = error instanceof Error ? error.message : "Unknown error";

    if (message.includes("GITHUB_TOKEN")) {
      return NextResponse.json(
        { error: "GitHub token not configured", details: message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch repositories", details: message },
      { status: 500 }
    );
  }
}
