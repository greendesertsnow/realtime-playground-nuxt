# Gemini Multimodal Live API Playground (Nuxt)

A real-time voice conversation playground for Google's Gemini 2.0 API, built with Nuxt 3 and LiveKit. This project enables seamless voice communication with AI using advanced multimodal capabilities.

## Features

- 🎙️ **Real-time voice conversation** with Gemini 2.0
- 📝 **Audio transcription** and visualization
- 🎭 **AI personality presets** for different conversation styles
- 🔐 **Secure API key management** 
- 📱 **Responsive design** with mobile support
- ⚡ **LiveKit WebRTC** for low-latency audio streaming

## Prerequisites

- Node.js 18+ or Bun
- Python 3.8+ with [uv](https://docs.astral.sh/uv/) package manager
- Google AI API key with Gemini 2.0 access
- LiveKit Cloud account (for real-time voice features)

## Quick Start

### 1. Installation

This project uses **Bun** as the package manager:

```bash
# Clone the repository
git clone <repository-url>
cd realtime-playground-nuxt

# Install dependencies
bun install
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```bash
# Google AI API Configuration
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key_here

# LiveKit Configuration (optional for local development)
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret
LIVEKIT_URL=wss://your-livekit-url
```

### 3. LiveKit Agent Setup

The project includes a Python-based LiveKit agent for handling real-time voice communication. Set it up separately:

```bash
# Navigate to the agent directory
cd agent

# Install Python dependencies using uv
uv sync

# Create a .env file in the agent directory
cat > .env << EOF
LIVEKIT_URL=wss://your-livekit-url
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret
EOF

# Start the agent in development mode
uv run --env-file .env python main.py dev
```

### 4. Development Server

Start the Nuxt development server:

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Getting API Keys

1. **Google AI API Key**:
   - Visit [Google AI Studio](https://aistudio.google.com/)
   - Create a new API key
   - Ensure you have access to Gemini 2.0

2. **LiveKit (Optional)**:
   - Sign up at [LiveKit Cloud](https://cloud.livekit.io/)
   - Create a project and get your API credentials

### Basic Usage

1. Enter your Google AI API key in the application
2. Select an AI personality preset or create a custom one
3. Click "Start Conversation" to begin voice chat
4. Speak naturally - the AI will respond in real-time

### Customizing AI Personalities

Edit the preset configurations in the application to:
- Change AI personality traits
- Modify response styles
- Set conversation contexts
- Adjust voice characteristics

## Architecture

- **Framework**: Nuxt 3 with Vue 3 Composition API
- **State Management**: Pinia stores
- **UI Components**: shadcn/ui with Tailwind CSS v4
- **Real-time**: LiveKit SDK for WebRTC connections
- **API**: Nuxt server routes for LiveKit token generation

## Development Commands

```bash
# Start development server
bun dev

# Build for production
bun run build

# Run linting
bun run lint

# Check code formatting
bun run format:check

# Preview production build
bun run preview
```

## Project Structure

```
├── agent/          # Python LiveKit agent
│   ├── main.py     # Agent entry point
│   ├── .env        # Agent environment variables
│   └── .venv/      # Python virtual environment
├── components/     # Vue components
├── composables/    # Vue composables and utilities
├── stores/         # Pinia state management
├── server/         # Nuxt server API routes
├── plugins/        # Nuxt plugins
├── assets/         # Static assets and styles
├── public/         # Public static files
└── data/          # Application data and configurations
```

## Deployment

### Vercel (Recommended)

```bash
# Build and deploy
bun run build
```

Deploy the `.output` directory to Vercel or your preferred hosting platform.

### Docker

```bash
# Build Docker image
docker build -t gemini-playground .

# Run container
docker run -p 3000:3000 gemini-playground
```

## Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GOOGLE_GENERATIVE_AI_API_KEY` | Google AI API key for Gemini access | Yes |
| `LIVEKIT_API_KEY` | LiveKit API key | No* |
| `LIVEKIT_API_SECRET` | LiveKit API secret | No* |
| `LIVEKIT_URL` | LiveKit server URL | No* |

*LiveKit credentials are optional for local development but required for production deployment.

## Troubleshooting

### Common Issues

1. **Audio not working**: Ensure microphone permissions are granted
2. **Connection failed**: Check API keys and network connectivity
3. **Build errors**: Verify all dependencies are installed with `bun install`

### Dependencies

Some dependencies may need updates:
- `@livekit/components-core` - check for latest version
- `@troisjs/trois` - may need Vue 3 compatible alternative
- `vue-syntax-highlighter` - may need replacement

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Resources

- [Nuxt 3 Documentation](https://nuxt.com/docs)
- [Google AI Documentation](https://ai.google.dev/)
- [LiveKit Documentation](https://docs.livekit.io/)
- [Vue 3 Documentation](https://vuejs.org/)
