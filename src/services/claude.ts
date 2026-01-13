import Anthropic from "@anthropic-ai/sdk";
import { PullRequest, SummaryResponse, SummaryStats } from "@/types";

let anthropicInstance: Anthropic | null = null;

function getAnthropic(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY environment variable is required");
  }

  if (!anthropicInstance) {
    anthropicInstance = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  return anthropicInstance;
}

function buildPRContext(prs: PullRequest[]): string {
  const prsByRepo = prs.reduce((acc, pr) => {
    if (!acc[pr.repo]) {
      acc[pr.repo] = [];
    }
    acc[pr.repo].push(pr);
    return acc;
  }, {} as Record<string, PullRequest[]>);

  let context = "";

  for (const [repo, repoPRs] of Object.entries(prsByRepo)) {
    context += `\n### Repository: ${repo}\n\n`;

    for (const pr of repoPRs) {
      context += `#### PR #${pr.number}: ${pr.title}\n`;
      context += `- **Author:** ${pr.author}\n`;
      context += `- **Merged:** ${new Date(pr.mergedAt).toLocaleDateString()}\n`;
      context += `- **Changes:** +${pr.additions} -${pr.deletions} (${pr.changedFiles} files)\n`;

      if (pr.description) {
        const truncatedDesc = pr.description.length > 500
          ? pr.description.slice(0, 500) + "..."
          : pr.description;
        context += `- **Description:** ${truncatedDesc}\n`;
      }

      if (pr.commits.length > 0) {
        context += `- **Commits:**\n`;
        for (const commit of pr.commits.slice(0, 10)) {
          context += `  - ${commit.message}\n`;
        }
        if (pr.commits.length > 10) {
          context += `  - ... and ${pr.commits.length - 10} more commits\n`;
        }
      }
      context += "\n";
    }
  }

  return context;
}

export async function generateSummary(
  org: string,
  prs: PullRequest[],
  fromDate: string,
  toDate: string
): Promise<SummaryResponse> {
  const anthropic = getAnthropic();

  const prContext = buildPRContext(prs);

  const systemPrompt = `You are an expert engineering manager assistant that creates concise, insightful summaries of development activity for CTOs and engineering leadership.

Your summaries should:
1. Be executive-focused - highlight business impact and strategic implications
2. Categorize changes into: Features, Bug Fixes, Refactoring, Documentation, Other
3. Identify patterns and trends across the organization
4. Highlight potential risks or areas needing attention
5. Be written in a professional, clear tone

Format your response in Markdown with clear sections.`;

  const userPrompt = `Analyze the following Pull Requests merged in the **${org}** organization from **${fromDate}** to **${toDate}** and create an executive summary for the CTO.

## Pull Requests Data
${prContext}

## Instructions
Create a comprehensive engineering report with:

1. **Executive Summary** (2-3 sentences overview)
2. **Key Metrics** (PRs merged, contributors, repositories)
3. **Features & Enhancements** - New functionality added
4. **Bug Fixes** - Issues resolved
5. **Technical Improvements** - Refactoring, performance, infrastructure
6. **Documentation Updates** - If any
7. **Highlights** - Most impactful changes
8. **Attention Points** - Risks, large changes, or areas to monitor

At the very end, provide a JSON block with category counts in this exact format:
\`\`\`json
{"features": X, "fixes": X, "refactoring": X, "docs": X, "other": X}
\`\`\`

Make the summary actionable and relevant for engineering leadership decision-making.`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: userPrompt,
      },
    ],
    system: systemPrompt,
  });

  const content = response.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type from Claude");
  }

  const text = content.text;

  // Extract stats from JSON block
  let stats: SummaryStats = {
    features: 0,
    fixes: 0,
    refactoring: 0,
    docs: 0,
    other: 0,
  };

  const jsonMatch = text.match(/```json\s*(\{[^}]+\})\s*```/);
  if (jsonMatch) {
    try {
      stats = JSON.parse(jsonMatch[1]);
    } catch (e) {
      console.error("Failed to parse stats JSON:", e);
    }
  }

  // Remove the JSON block from the summary
  const summary = text.replace(/```json\s*\{[^}]+\}\s*```/, "").trim();

  return {
    summary,
    stats,
  };
}

export async function* generateSummaryStream(
  org: string,
  prs: PullRequest[],
  fromDate: string,
  toDate: string
): AsyncGenerator<string, void, unknown> {
  const anthropic = getAnthropic();

  const prContext = buildPRContext(prs);

  const systemPrompt = `You are an expert engineering manager assistant that creates concise, insightful summaries of development activity for CTOs and engineering leadership.

Your summaries should:
1. Be executive-focused - highlight business impact and strategic implications
2. Categorize changes into: Features, Bug Fixes, Refactoring, Documentation, Other
3. Identify patterns and trends across the organization
4. Highlight potential risks or areas needing attention
5. Be written in a professional, clear tone

Format your response in Markdown with clear sections.`;

  const userPrompt = `Analyze the following Pull Requests merged in the **${org}** organization from **${fromDate}** to **${toDate}** and create an executive summary for the CTO.

## Pull Requests Data
${prContext}

## Instructions
Create a comprehensive engineering report with:

1. **Executive Summary** (2-3 sentences overview)
2. **Key Metrics** (PRs merged, contributors, repositories)
3. **Features & Enhancements** - New functionality added
4. **Bug Fixes** - Issues resolved
5. **Technical Improvements** - Refactoring, performance, infrastructure
6. **Documentation Updates** - If any
7. **Highlights** - Most impactful changes
8. **Attention Points** - Risks, large changes, or areas to monitor

Make the summary actionable and relevant for engineering leadership decision-making.`;

  const stream = await anthropic.messages.stream({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: userPrompt,
      },
    ],
    system: systemPrompt,
  });

  for await (const event of stream) {
    if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
      yield event.delta.text;
    }
  }
}
