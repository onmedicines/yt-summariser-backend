import e from "express";
import type { Request, Response } from "express";
import "dotenv/config";
import cors from "cors";
import { summarizeTranscript } from "./services/summarise_transcript_service.js";
import {
  fetchSubtitles,
  fetchVideoDetails,
} from "./services/extract_transcript_service.js";
import { respondWithError } from "./utils/error_util.js";

const app = e();
app.use(cors());
app.use(e.json());
app.use(e.urlencoded({ extended: true }));

app.get("/health", (_, res: Response) => {
  return res.status(200).json({ hello: "world" });
});

app.post("/transcribe", async (req: Request, res: Response) => {
  try {
    const { videoId } = req.body;
    if (!videoId) throw new Error("Video ID isn't provided or does not exist");
    const videoDetials = await fetchVideoDetails(videoId);
    if (!videoDetials) throw new Error("Video details could not be fetched");

    return res.status(200).json({ videoDetials });
  } catch (e) {
    return respondWithError(res, e);
  }
});

app.post("/summarise", async (req: Request, res: Response) => {
  try {
    const { videoId } = req.body;
    if (!videoId) throw new Error("Video ID isn't provided or does not exist");
    const subtitles = await fetchSubtitles(videoId);
    if (!subtitles) throw new Error("Video details could not be fetched");
    // flatten the subtitle object into a single transcript string
    const transcript = subtitles.map((subtitle) => subtitle.text).join(" ");
    const summary = await summarizeTranscript(transcript);

    return res.status(200).json({ summary });
  } catch (e) {
    return respondWithError(res, e);
  }
});

app.listen(process.env.PORT, () => {
  console.log(`server running on port ${process.env.PORT}`);
});
