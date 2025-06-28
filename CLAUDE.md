# Claude Code Information

## Project

This is a Nuxt translation of a Next.js Gemini Multimodal Live API playground. The project enables real-time voice communication with Google's Gemini 2.0 API using LiveKit agents.

## Package Manager

Use `bun` for package management instead of npm.

## Development Commands

- `bun dev` - Start development server
- `bun run build` - Build for production
- `bun run lint` - Run ESLint
- `bun run format:check` - Check code formatting

## Architecture

- **Framework**: Nuxt 3 with Vue 3 Composition API
- **State Management**: Pinia stores
- **UI Components**: shadcn/ui with Tailwind CSS v4
- **Real-time**: LiveKit SDK for WebRTC connections
- **API**: Nuxt server API routes for LiveKit token generation

## Key Features

- Real-time voice conversation with Gemini 2.0
- Audio transcription and visualization
- Preset management for different AI personalities
- Authentication with Gemini API keys
- Responsive design with mobile support

## Translation Progress

The project is approximately 65% complete with Phase 1 (core infrastructure) finished:

- ✅ Pinia state management
- ✅ Authentication system
- ✅ API token generation
- ✅ Connection management
- ✅ Agent interaction framework

## Dependencies to Fix

Some dependencies need to be updated or replaced:

- `@livekit/components-core` - needs correct version
- `@troisjs/trois` - may need alternative
- `vue-syntax-highlighter` - may need alternative

## Git Workflow

- Use `.gitignore` to exclude build outputs, dependencies, and sensitive files
- Environment variables are stored in `.env` files (excluded from git)
- API keys and secrets should never be committed

## Project Structure

```
├── components/     # Vue components
├── composables/    # Vue composables and utilities
├── stores/         # Pinia state management
├── server/         # Nuxt server API routes
├── plugins/        # Nuxt plugins
├── assets/         # Static assets and styles
├── public/         # Public static files
└── data/          # Application data and configurations
```
