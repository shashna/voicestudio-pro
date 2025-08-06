import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function generateTTS(text: string) {
  return openai.audio.speech.create({
    model: "tts-1",
    input: text,
    voice: "alloy"
  });
}

// Placeholder for Sora video generation
export async function generateSoraVideo(prompt: string) {
  throw new Error("Sora video generation is not implemented yet.");
}