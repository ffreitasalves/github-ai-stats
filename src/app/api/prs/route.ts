import { NextRequest, NextResponse } from "next/server";
import { getMergedPRs } from "@/services/github";
import { PRsResponse, APIError } from "@/types";

export async function POST(
  request: NextRequest
): Promise<NextResponse<PRsResponse | APIError>> {
  try {
    const body = await request.json();
    const { org, repos, fromDate, toDate } = body;

    if (!org || !repos || !fromDate || !toDate) {
      return NextResponse.json(
        { error: "Missing required fields: org, repos, fromDate, toDate" },
        { status: 400 }
      );
    }

    if (!Array.isArray(repos) || repos.length === 0) {
      return NextResponse.json(
        { error: "repos must be a non-empty array" },
        { status: 400 }
      );
    }

    const prs = await getMergedPRs(org, repos, fromDate, toDate);

    return NextResponse.json({
      totalPRs: prs.length,
      prs,
    });
  } catch (error) {
    console.error("Error fetching PRs:", error);

    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      { error: "Failed to fetch pull requests", details: message },
      { status: 500 }
    );
  }
}
