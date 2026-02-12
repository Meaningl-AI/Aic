# Meaningl AI - AI-Powered Multi-Modal Assistant

## Overview

Meaningl AI is a Vietnamese-language AI assistant application that provides multiple AI-powered features including chat, web search, image generation, video generation, and code assistance. The application follows a full-stack architecture with a React frontend and Express backend, leveraging Replit's AI Integrations for LLM capabilities.

The application features a futuristic neon-themed UI with rainbow-animated branding, dark mode as default, real-time chat streaming via Server-Sent Events (SSE), and voice input support using the browser's native Web Speech API.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight alternative to React Router)
- **State Management**: TanStack React Query for server state and caching
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style)
- **Animations**: Framer Motion for page transitions and UI effects
- **Markdown Rendering**: react-markdown with remark-gfm for chat responses
- **Code Highlighting**: react-syntax-highlighter with VS Code dark theme

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with tsx for development
- **Build Tool**: esbuild for server bundling, Vite for client bundling
- **API Pattern**: RESTful endpoints with SSE for streaming responses

### Authentication
- **Provider**: Google OAuth 2.0 (independent, not Replit Auth)
- **Library**: passport-google-oauth20
- **Module**: `server/replit_integrations/auth/` with passport.js + Google Strategy
- **Client Hook**: `useAuth()` from `@/hooks/use-auth.ts`
- **Session**: PostgreSQL-backed sessions via connect-pg-simple
- **Env Vars**: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET required

### Data Storage
- **Database**: PostgreSQL via Drizzle ORM
- **Schema Location**: `shared/schema.ts`, `shared/models/chat.ts`, `shared/models/auth.ts`
- **Tables**: 
  - `conversations` - Chat conversation metadata
  - `messages` - Individual chat messages with role and content
  - `searches` - Search query logging
  - `users` - User accounts (Replit Auth)
  - `sessions` - Session storage (Replit Auth)

### AI Integrations (Replit-specific)
The application uses Replit's AI Integrations located in `server/replit_integrations/`:
- **Chat**: OpenAI-compatible API for conversational AI with streaming
- **Image**: Image generation using `gpt-image-1` model
- **Auth**: Replit Auth OIDC for user authentication
- **Audio**: Voice chat with speech-to-text and text-to-speech capabilities
- **Batch**: Utility for rate-limited batch processing

### Key Design Patterns
- **Monorepo Structure**: Client (`client/`), server (`server/`), and shared code (`shared/`)
- **Path Aliases**: `@/` for client source, `@shared/` for shared code
- **API Contract**: Zod schemas in `shared/routes.ts` for type-safe API definitions
- **Storage Interface**: Abstract storage pattern in `server/storage.ts` for database operations
- **SSE Streaming**: Real-time chat responses using eventsource-parser on client

### Pages and Features
1. **Chat** (`/`) - Main conversational AI interface with streaming responses
2. **Search** (`/search`) - Web, image, video, and code search (mock implementation)
3. **Image** (`/image`) - AI image generation from text prompts
4. **Video** (`/video`) - Two modes: (a) Text-to-video: 12 keyframes with cinematic gait-cycle prompts, gentle zoompan camera effects, dissolve-heavy xfade transitions, minterpolate motion interpolation with scene-change disabled, cinematic color grading (eq+unsharp), 24fps 1280x720 12-second output. (b) GPU mode: Temporarily disabled for maintenance (Image upload to external Stable Video Diffusion server)
5. **Code** (`/code`) - Code assistance and generation

## External Dependencies

### AI Services
- **OpenAI-compatible API**: Via Replit AI Integrations (`AI_INTEGRATIONS_OPENAI_API_KEY`, `AI_INTEGRATIONS_OPENAI_BASE_URL`)
- **Models Used**: 
  - Chat: Standard OpenAI chat completions
  - Images: `gpt-image-1` for generation

### Database
- **PostgreSQL**: Connection via `DATABASE_URL` environment variable
- **ORM**: Drizzle with `drizzle-kit` for migrations

### Key NPM Packages
- **UI**: Radix UI primitives, Tailwind CSS, class-variance-authority
- **Data**: @tanstack/react-query, drizzle-orm, zod
- **Streaming**: eventsource-parser for SSE parsing
- **Audio**: Web Audio API with custom AudioWorklet for voice playback

### Environment Variables Required
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Session encryption secret (for Replit Auth)
- `AI_INTEGRATIONS_OPENAI_API_KEY` - OpenAI API key for AI features
- `AI_INTEGRATIONS_OPENAI_BASE_URL` - Base URL for OpenAI-compatible API
- `REPL_ID` - Replit app ID (auto-provided by Replit)

### Build and Development
- `npm run dev` - Development server with hot reload
- `npm run build` - Production build (client + server bundling)
- `npm run db:push` - Push schema changes to database