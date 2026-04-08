# GitPReview

AI-powered GitHub PR review application that helps developers get intelligent feedback on pull requests.

<!-- Add screenshot of main dashboard here -->
![Dashboard](public/gitPreview2.png)

## Tech Stack

- **Framework**: TanStack Start (React 19, TanStack Router, Vite)
- **Database**: PostgreSQL via Prisma (Neon)
- **Auth**: Better Auth + GitHub OAuth
- **AI/ML**: Google Gemini (AI SDK), Pinecone (vector DB for RAG)
- **Background Jobs**: Inngest
- **Payments**: Polar
- **Styling**: Tailwind CSS 4, shadcn/ui

## Features

- GitHub OAuth authentication
- Connect GitHub repositories
- AI-powered PR reviews using Gemini
- RAG-based context retrieval from repository history
- Subscription management via Polar

## How It Works

1. **Connect Repository**: Users authenticate via GitHub OAuth and connect repositories they want reviewed
2. **Open a PR**: When a pull request is opened on a connected repository
3. **AI Review Generated**: Inngest triggers a background job that:
   - Fetches the PR diff and details from GitHub
   - Retrieves relevant context from the repository history using Pinecone RAG
   - Generates an intelligent review using Google Gemini
4. **Review Posted**: The AI-generated review is posted as a PR comment

<!-- Add screenshot of generated GitHub review comment here -->
![Review Comment](public/gitPreview1.png)

## Prerequisites

- [Bun](https://bun.sh/) (v1.0 or later)
- Node.js 18+ (for some native modules)
- GitHub OAuth App (create at https://github.com/settings/developers)
- Neon PostgreSQL database (or any PostgreSQL)
- Pinecone account for vector database
- Google AI API key for Gemini

## Setup

### 1. Clone and Install

```bash
git clone <repository-url>
cd gitPReview
bun install
```

### 2. Environment Variables

Create a `.env` file in the root directory:

```bash
DATABASE_URL="postgresql://user:password@host:5432/database"
BETTER_AUTH_SECRET="your-secret-key-min-32-chars"
BETTER_AUTH_URL="http://localhost:3000"

# GitHub OAuth (from your GitHub OAuth App)
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Google AI for Gemini
GOOGLE_GENERATIVE_AI_API_KEY="your-google-api-key"

# Pinecone Vector DB
PINECONE_DB_API_KEY="your-pinecone-api-key"
PINECONE_INDEX_NAME="gitpreview"

# Polar Payments (optional for local dev)
POLAR_ACCESS_TOKEN="your-polar-access-token"
POLAR_PUBLISHABLE_KEY="your-polar-publishable-key"
POLAR_SERVER_URL="https://api.polar.sh"
POLAR_PRODUCT_ID="your-product-id"

# Inngest (set to 1 for local development)
INNGEST_DEV=1
INNGEST_EVENT_KEY="your-inngest-event-key"
```

### 3. Database Setup

```bash
# Push the Prisma schema to your database
bunx prisma db push
```

### 4. Run the Application

```bash
bun run dev
```

The app will be available at `http://localhost:3000`.

### 5. Ngrok for Webhooks (Optional, for local webhook testing)

If you need to test GitHub webhooks or Polar callbacks locally:

```bash
ngrok http 3000
```

Then configure your GitHub OAuth App and Polar webhook URL to point to your ngrok URL.

## Project Structure

```
src/
├── routes/              # TanStack Router file-based routing
│   ├── api/            # API routes (auth, webhooks, inngest)
│   ├── auth/           # Authentication pages
│   └── _protected/     # Protected dashboard routes
├── inngest/
│   ├── client.ts       # Inngest client configuration
│   └── functions/      # Background job definitions
│       ├── review.ts   # PR review generation
│       └── indexRepo.ts # Repository indexing for RAG
├── lib/
│   ├── auth.ts         # Better Auth configuration
│   ├── github/         # GitHub API integration
│   ├── ai/             # AI/RAG functionality
│   └── pinecone.ts     # Vector DB client
└── components/         # React components
```

## Available Scripts

| Command              | Description                           |
| -------------------- | ------------------------------------- |
| `bun run dev`        | Start development server on port 3000 |
| `bun run build`      | Build for production                  |               |
| `bunx prisma studio` | Open Prisma Studio (dev only)         |

## Environment Variables Reference

| Variable                       | Required | Description                           |
| ------------------------------ | -------- | ------------------------------------- |
| `DATABASE_URL`                 | Yes      | PostgreSQL connection string          |
| `BETTER_AUTH_SECRET`           | Yes      | Auth encryption secret (min 32 chars) |
| `BETTER_AUTH_URL`              | Yes      | App URL for auth callbacks            |
| `GITHUB_CLIENT_ID`             | Yes      | GitHub OAuth App client ID            |
| `GITHUB_CLIENT_SECRET`         | Yes      | GitHub OAuth App client secret        |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Yes      | Google AI API key                     |
| `PINECONE_DB_API_KEY`          | Yes      | Pinecone API key                      |
| `PINECONE_INDEX_NAME`          | Yes      | Pinecone index name                   |
| `POLAR_*`                      | No       | Polar payment configuration           |
| `INNGEST_DEV`                  | Dev      | Enable Inngest dev server             |
| `INNGEST_EVENT_KEY`            | Prod     | Inngest event key for production      |
