import {
  grammarAgent,
  literaryAgent,
  readingAgent,
  rewritingAgent,
} from "@/mastra/agents";
import { Step, Workflow } from "@mastra/core";
import { z } from "zod";

export const myWorkflow = new Workflow({
  name: "my-workflow",
  triggerSchema: z.object({
    chapterText: z.string(),
    literaryPrompt: z.string(),
    readingLevelPrompt: z.string(),
  }),
});

const grammarCheckSchema = z.object({
  analysis:
    z.object({
      errors: z.string(),
      explanation: z.string(),
    }),
  steps: z.array(
    z.object({
      syntax_and_grammar: z.string(),
      diction_and_vocabulary: z.string(),
    })
  ),
});

const stepOne = new Step({
  id: "stepOne",
  outputSchema: grammarCheckSchema,
  execute: async ({ context }) => {
    const response = await grammarAgent.generate(
      [{ role: "user", content: context.triggerData.chapterText }],
      { output: grammarCheckSchema }
    );
    return response.object;
  },
});

const literaryRewriteSchema = z.object({
  analysis: z.string(),
  steps: z.array(
    z.object({
      syntax_and_grammar: z.string(),
      diction_and_vocabulary: z.string(),
      structural_modifications: z.string(),
      literary_techniques: z.string(),
    })
  ),
});

const stepTwo = new Step({
  id: "stepTwo",
  outputSchema: literaryRewriteSchema,
  execute: async ({ context, suspend }) => {
    if (context.inputData.suspend != false) {
      await suspend({
        result: context.getStepResult(stepOne),
      });
    }
    const response = await literaryAgent.generate(
      [
        {
          role: "user",
          content: `Text: ${context.triggerData.chapterText}\nPrompt: ${context.triggerData.literaryPrompt}`,
        },
      ],
      { output: literaryRewriteSchema }
    );
    return response.object;
  },
});

const readingRewriteSchema = z.object({
  analysis: z.string(),
  steps: z.array(
    z.object({
      sentence_complexity: z.string(),
      vocabulary_difficulty: z.string(),
      conceptual_density: z.string(),
    })
  ),
});

const stepThree = new Step({
  id: "stepThree",
  outputSchema: readingRewriteSchema,
  execute: async ({ context, suspend }) => {
    if (context.inputData.suspend == false) {
      await suspend({
        result: context.getStepResult(stepTwo),
      });
    }
    const response = await readingAgent.generate(
      [
        {
          role: "user",
          content: `Text: ${context.triggerData.chapterText}\nPrompt: ${context.triggerData.readingLevelPrompt}`,
        },
      ],
      { output: readingRewriteSchema }
    );
    return response.object;
  },
});

const stepFour = new Step({
  id: "stepFour",
  execute: async ({ context, suspend }) => {

    if (context.inputData.suspend != false) {
      await suspend({
        result: context.getStepResult(stepThree),
      });
    }
    const grammarGuidelines = context.getStepResult(stepOne);
    const literaryGuidelines = context.getStepResult(stepTwo);
    const readingGuideline = context.getStepResult(stepThree);
    const grammarResponse = await rewritingAgent.generate([
      {
        role: "user",
        content: `Text: ${context.triggerData.chapterText}\nGuidlines:, ${JSON.stringify(grammarGuidelines)}`,
      },
    ]);
    const response = await rewritingAgent.generate([
      {
        role: "user",
        content: `Text: ${grammarResponse.text}\nGuidlines:, ${JSON.stringify(literaryGuidelines)}`,
      },
    ]);
    const responseFinal = await rewritingAgent.generate([
      {
        role: "user",
        content: `Text: ${response.text}\nGuidlines: ${JSON.stringify(readingGuideline)}`,
      },
    ]);
    return responseFinal.text;
  },
});

myWorkflow.step(stepOne).then(stepTwo).then(stepThree).then(stepFour).commit();
