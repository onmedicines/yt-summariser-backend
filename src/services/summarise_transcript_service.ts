import "dotenv/config";
import { z } from "zod";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "@langchain/core/output_parsers";

const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  temperature: 0.4,
});

const summarySchema = z.object({
  summary: z.string(),
  keyPoints: z.array(z.string()),
});
type SummaryResponse = z.infer<typeof summarySchema>;

const parser = StructuredOutputParser.fromZodSchema(summarySchema);

export async function summarizeTranscript(
  transcript: string
): Promise<SummaryResponse> {
  if (!transcript || transcript.length < 20) {
    throw new Error("Transcript is too short or missing.");
  }

  const wordCount = transcript.split(/\s+/).length;

  let summaryInstructions = "";

  if (wordCount > 2500) {
    summaryInstructions = `
      This is a long transcript. Provide a detailed 3–5 paragraph summary,
      capturing main ideas, structure, important examples, and conclusions.
    `;
  } else if (wordCount > 800) {
    summaryInstructions = `
      Provide a medium-length summary of 6–12 sentences.
      Capture context, insights, and all key points.
    `;
  } else {
    summaryInstructions = `
      Provide a concise 4–6 sentence summary.
    `;
  }

  summaryInstructions +=
    " Also scale the number of key points accordingly. DO NOT MISS OUT IMPORTANT KEY POINTS JUST IT CONCISE";

  const prompt = ChatPromptTemplate.fromTemplate(`
    You are an expert video summarizer.
    You must return ONLY a valid JSON object with no markdown formatting, no code blocks, and no additional text.
    The transcript length is approximately ${wordCount} words.
    ${summaryInstructions}

    Given the transcript below, write the summary accordingly
    and extract the most important key points.

    Transcript:
    ---------------
    {transcript}
    ---------------

    Do NOT include:
    - Markdown code blocks (\`\`\`json or \`\`\`)
    - Any text before or after the JSON
    - Escaped quotes within the JSON structure

    {{
      "summary": "Full summary text...",
      "keyPoints": [
        "point 1...",
        "point 2...",
        "point 3...",
        "and so on..."
      ]
    }}


    Return only the JSON object:
  `);

  const chain = prompt.pipe(model).pipe(parser);

  const response = await chain.invoke({
    transcript,
  });

  return response;
}
