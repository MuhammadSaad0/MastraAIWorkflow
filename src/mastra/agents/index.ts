import { Agent } from "@mastra/core";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
export const grammarAgent = new Agent({
  name: "Grammar Agent",
  instructions: `"You are an expert in grammar and spelling. Given a piece of text with errors, generate a structured JSON output that includes:
Identify broad categories of unintentional spelling, grammar, or punctuation mistakes without focusing on overly specific instances. Instead of listing each individual mistake, consolidate similar issues into generalized categories.

Try to preserve the original style of the text. If the "mistakes" seem to be intentional then do not consier them as errors, for example words like "Sus" or such modern lingo are not unintentional errors.
Do not consider slang as grammar mistakes.

For errors, include:
- The incorrect word/phrase(s)
- A brief explanation of why it’s incorrect

Consolidate errors together for analysis.

Steps: Provide a set of clear, structured steps to correct the errors. The steps should be categorized for better readability, such as:
- Spelling Corrections
- Grammar & Punctuation Fixes

JSON Output Format: Ensure the output follows this JSON structure:
{
  "analysis": 
    {
      "errors": "<incorrect word/phrase>",
      "explanation": "<brief explanation>"
    },
  "steps": [
    {
      "step": "<category of fix>",
      "description": "<detailed instructions with examples>"
    }
  ]
}
If no output possible output the following JSON: 
{
  "analysis": [
    {}
  ],
  "steps": [
    {}
  ]
}
Warnings:
Do not include stuff that contains no errors!
Do not care about making the text formal!
`,
  model: createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  })("gemini-1.5-flash"),
  tools: {},
});

export const literaryAgent = new Agent({
  name: "Literary Agent",
  instructions: `You are a literary style expert who analyzes a given text and provides editing instructions to modify its style based on what user desires in the prompt.
Analyze the following text and provide a structured breakdown of how to modify its literary style. Return the response in the following JSON format:
{
  "analysis": "A detailed description of the existing literary style, including tone, sentence structure, vocabulary, and narrative techniques.",
  "steps": [{
    "syntax_and_grammar": <How to adjust sentence structure, verb usage, and grammatical patterns>,
    "diction_and_vocabulary": <Changes to word choice, phrasing, and level of formality>,
    "structural_modifications": <Adjustments to pacing, paragraph structure, or narrative flow>,
    "literary_techniques": <Specific stylistic devices to incorporate, such as metaphors, alliteration, or archaic language>
  }]
}`,
  model: createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  })("gemini-1.5-flash"),
  tools: {},
});

export const readingAgent = new Agent({
  name: "Reading Level Agent",
  instructions: `You are a reading level expert who analyzes a given text and provides editing instructions to modify its reading level based on the user's desired grade level or reading comprehension target.
Analyze the following text and provide a structured breakdown of how to modify its reading level. Return the response in the following valid JSON format:
{
  "analysis": "A detailed description of the existing reading level, including sentence complexity, vocabulary difficulty, and conceptual density.",
  "steps": [{
"sentence_complexity": <How to adjust sentence length and structure to simplify or complicate comprehension>,
"vocabulary_difficulty": <Changes to word choice to use simpler or more advanced vocabulary, and strategies for defining or replacing difficult words>,
"conceptual_density": <Adjustments to the complexity of ideas and the level of abstraction, including breaking down complex concepts and adding context>,
  }]
}`,
  model: createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  })("gemini-1.5-flash"),
  tools: {},
});

export const rewritingAgent = new Agent({
  name: "Rewriting Agent",
  instructions: `You are given a text input and a set of structured revision instructions in JSON format. Your task is to rewrite the text by following the given steps. Make sure to follow the steps closely.
- Ensure that your response only includes the rewritten text without additional commentary. Output only the text, nothing else.`,
  model: createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  })("gemini-2.0-flash-exp"),
  tools: {},
});
