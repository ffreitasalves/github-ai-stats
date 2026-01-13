# GitHub PR Summary

AI-powered engineering reports for leadership. Generate comprehensive summaries of merged pull requests across your GitHub organization using Claude AI.

## Features

- **Organization-wide PR Analysis**: Fetch merged PRs from multiple repositories in a GitHub organization
- **Date Range Filtering**: Select specific time periods for your reports
- **AI-Powered Summaries**: Claude generates executive summaries categorizing changes by type
- **Streaming Responses**: Watch the AI summary generate in real-time
- **Export Options**: Download reports as Markdown or copy to clipboard

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **GitHub API**: @octokit/rest
- **AI**: Anthropic Claude API

## Prerequisites

- Node.js 18+
- GitHub Personal Access Token with `repo` and `read:org` scopes
- Anthropic API Key

## Setup

1. Clone the repository:

```bash
git clone https://github.com/lucasbrunialti/github-ai-stats.git
cd github-ai-stats
```

2. Install dependencies:

```bash
npm install
```

3. Create environment file:

```bash
cp .env.example .env.local
```

4. Configure your environment variables in `.env.local`:

```env
GITHUB_TOKEN=ghp_your_github_token
ANTHROPIC_API_KEY=sk-ant-your_anthropic_key
```

5. Run the development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Enter a GitHub organization or username
2. Select the repositories you want to analyze
3. Choose the date range for merged PRs
4. Click "Fetch Pull Requests" to retrieve the data
5. Review the list of PRs found
6. Click "Generate AI Summary" to create the report
7. Download or copy the generated report

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/orgs/[org]/repos` | List repositories for an organization |
| `POST` | `/api/prs` | Fetch merged PRs for selected repositories |
| `POST` | `/api/summary` | Generate AI summary of PRs |

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── orgs/[org]/repos/  # Organization repos endpoint
│   │   ├── prs/               # Pull requests endpoint
│   │   └── summary/           # AI summary endpoint
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx               # Main application page
├── components/
│   ├── DateRangePicker.tsx
│   ├── LoadingState.tsx
│   ├── OrgInput.tsx
│   ├── PRList.tsx
│   ├── RepoSelector.tsx
│   └── SummaryReport.tsx
├── lib/
│   └── utils.ts
├── services/
│   ├── claude.ts              # Claude AI integration
│   └── github.ts              # GitHub API integration
└── types/
    └── index.ts
```

## License

MIT
