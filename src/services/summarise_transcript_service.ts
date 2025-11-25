import "dotenv/config";
import { z } from "zod";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import {
  StructuredOutputParser,
  StringOutputParser,
} from "@langchain/core/output_parsers";

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
    You are an expert summarizer. 
    Return ONLY a valid JSON object. 
    No explanations. No markdown. No code fences.

    JSON schema:
    {{
      "summary": "string",
      "keyPoints": ["string", "string", ...]
    }}

    Transcript length: ${wordCount} words.
    Instructions: ${summaryInstructions}

    Transcript:
    ---------------
    {transcript}
    ---------------

    Return only valid JSON
`);

  const chain = prompt.pipe(model).pipe(new StringOutputParser()).pipe(parser);

  const response = await chain.invoke({
    transcript,
  });

  return response;
}
