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

const errorSchema = z.object({});

const grammarCheckSchema = z.object({
  analysis: z.object({
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
  outputSchema: z.union([grammarCheckSchema, errorSchema]),
  execute: async ({ context }) => {
    try {
      const response = await grammarAgent.generate(
        [{ role: "user", content: context.triggerData.chapterText }],
        { output: grammarCheckSchema }
      );
      return response.object;
    } catch (err) {
      console.log(err);
      return {
        error: true,
        step: "stepOne",
      };
    }
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
  outputSchema: z.union([literaryRewriteSchema, errorSchema]),
  execute: async ({ context, suspend }) => {
    try {
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
    } catch (err) {
      console.log(err);
      return {
        error: true,
        step: "stepTwo",
      };
    }
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
  outputSchema: z.union([readingRewriteSchema, errorSchema]),
  execute: async ({ context, suspend }) => {
    try {
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
    } catch (err) {
      console.log(err);
      return {
        error: true,
        step: "stepThree",
      };
    }
  },
});

const stepFour = new Step({
  id: "stepFour",
  execute: async ({ context, suspend }) => {
    try {
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
          content: `Text: ${
            context.triggerData.chapterText
          }\nGuidlines:, ${JSON.stringify(grammarGuidelines)}`,
        },
      ]);
      const response = await rewritingAgent.generate([
        {
          role: "user",
          content: `Text: ${grammarResponse.text}\nGuidlines:, ${JSON.stringify(
            literaryGuidelines
          )}`,
        },
      ]);
      const responseFinal = await rewritingAgent.generate([
        {
          role: "user",
          content: `Text: ${response.text}\nGuidlines: ${JSON.stringify(
            readingGuideline
          )}`,
        },
      ]);
      return responseFinal.text;
    } catch (err) {
      console.log(err);
      return {
        error: true,
        step: "stepFour",
      };
    }
  },
});

myWorkflow.step(stepOne).then(stepTwo).then(stepThree).then(stepFour).commit();
