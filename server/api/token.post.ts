import { AccessToken } from "livekit-server-sdk";
import type { PlaygroundState } from "~/data/playground-state";

export default defineEventHandler(async (event) => {
  let playgroundState: PlaygroundState;

  try {
    playgroundState = await readBody(event);
  } catch (error) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid JSON in request body",
    });
  }

  const {
    instructions,
    geminiAPIKey,
    sessionConfig: { modalities, voice, temperature, maxOutputTokens },
  } = playgroundState;

  if (!geminiAPIKey) {
    throw createError({
      statusCode: 400,
      statusMessage: "Gemini API key is required",
    });
  }

  const roomName = Math.random().toString(36).slice(7);

  const config = useRuntimeConfig();
  const apiKey = config.public.livekitApiKey || process.env.LIVEKIT_API_KEY;
  const apiSecret =
    config.public.livekitApiSecret || process.env.LIVEKIT_API_SECRET;
  const livekitUrl =
    config.public.livekitWsUrl ||
    process.env.LIVEKIT_URL ||
    process.env.LIVEKIT_WS_URL;

  if (!apiKey || !apiSecret) {
    throw createError({
      statusCode: 500,
      statusMessage: "LIVEKIT_API_KEY and LIVEKIT_API_SECRET must be set",
    });
  }

  const at = new AccessToken(apiKey, apiSecret, {
    identity: "human",
    metadata: JSON.stringify({
      instructions: instructions,
      modalities: modalities,
      voice: voice,
      temperature: temperature,
      max_output_tokens: maxOutputTokens,
      gemini_api_key: geminiAPIKey,
    }),
  });

  at.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canPublishData: true,
    canSubscribe: true,
    canUpdateOwnMetadata: true,
  });

  return {
    accessToken: await at.toJwt(),
    url: livekitUrl,
  };
});
