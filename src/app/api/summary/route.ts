import { NextRequest, NextResponse } from "next/server";
import { generateSummary, generateSummaryStream } from "@/services/claude";
import { SummaryResponse, APIError, PullRequest } from "@/types";

export async function POST(
  request: NextRequest
): Promise<NextResponse<SummaryResponse | APIError> | Response> {
  try {
    const body = await request.json();
    const { org, prs, fromDate, toDate, stream = false } = body;

    if (!org || !prs || !fromDate || !toDate) {
      return NextResponse.json(
        { error: "Missing required fields: org, prs, fromDate, toDate" },
        { status: 400 }
      );
    }

    if (!Array.isArray(prs) || prs.length === 0) {
      return NextResponse.json(
        { error: "prs must be a non-empty array" },
        { status: 400 }
      );
    }

    // Streaming response
    if (stream) {
      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          try {
            const generator = generateSummaryStream(
              org,
              prs as PullRequest[],
              fromDate,
              toDate
            );

            for await (const chunk of generator) {
              controller.enqueue(encoder.encode(chunk));
            }

            controller.close();
          } catch (error) {
            controller.error(error);
          }
        },
      });

      return new Response(readable, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Transfer-Encoding": "chunked",
        },
      });
    }

    // Non-streaming response
    const result = await generateSummary(
      org,
      prs as PullRequest[],
      fromDate,
      toDate
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error generating summary:", error);

    const message = error instanceof Error ? error.message : "Unknown error";

    if (message.includes("ANTHROPIC_API_KEY")) {
      return NextResponse.json(
        { error: "Anthropic API key not configured", details: message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate summary", details: message },
      { status: 500 }
    );
  }
}
