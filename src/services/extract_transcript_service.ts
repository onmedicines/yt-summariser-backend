import { getSubtitles, getVideoDetails } from "youtube-caption-extractor";
import type { Subtitle, VideoDetails } from "youtube-caption-extractor";

export const fetchSubtitles = async (
  videoID: string,
  lang = "en"
): Promise<Subtitle[]> => {
  try {
    const subtitles: Subtitle[] = await getSubtitles({ videoID, lang });
    return subtitles;
  } catch (error) {
    console.error("Error fetching subtitles:", error);
    return [];
  }
};

export const fetchVideoDetails = async (
  videoID: string,
  lang = "en"
): Promise<VideoDetails> => {
  try {
    const details: VideoDetails = await getVideoDetails({ videoID, lang });
    return details;
  } catch (error) {
    console.error("Error fetching video details:", error);
    throw error;
  }
};
