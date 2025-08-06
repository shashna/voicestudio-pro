import type { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import fs from "fs";
import { openai } from "@/lib/openai";

export const config = { api: { bodyParser: false } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const form = new formidable.IncomingForm({
    uploadDir: "/tmp",
    keepExtensions: true,
  });

  form.parse(req, async (err, fields, files) => {
    if (err || !files.audio) {
      return res.status(500).json({ error: "File upload failed" });
    }
    const file = Array.isArray(files.audio) ? files.audio[0] : files.audio;
    const filePath = file.filepath || file.path;

    try {
      const audioStream = fs.createReadStream(filePath);
      const transcription = await openai.audio.transcriptions.create({
        file: audioStream as any,
        model: "whisper-1",
        response_format: "text"
      });

      fs.unlink(filePath, () => {});
      res.status(200).json({ transcript: transcription as string });
    } catch (e: any) {
      res.status(500).json({ error: "Transcription failed", details: e.message });
    }
  });
}