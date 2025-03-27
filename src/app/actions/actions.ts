"use server";

import { mastra } from "@/mastra";

const myWorkflow = mastra.getWorkflow("myWorkflow");
let run: any
export async function startWorkflow(formData: FormData) {
  const text = formData.get("text") as string;
  const prompt1 = formData.get("prompt1") as string;
  const prompt2 = formData.get("prompt2") as string;

  try {
    run = myWorkflow.createRun();

    const result = await run.start({
      triggerData: { chapterText: text, literaryPrompt: prompt1, readingLevelPrompt: prompt2 },
    });
    const isLiterarySuspended = result.activePaths.get('stepTwo')?.status === 'suspended';
    if(isLiterarySuspended) {
        const grammarResults = result.activePaths.get('stepTwo')?.suspendPayload;
        return { results: grammarResults, step: 'stepTwo', runId: result.runId }
    }
    return { success: false, error: "Failed to start workflow." };
  } catch (error) {
    console.error("Error starting workflow:", error);
    return { success: false, error: "Failed to start workflow." };
  }
}

export async function step(step: string, runId: string) {
    let suspend
    if(step == 'stepTwo') suspend = false
    else if(step == 'stepThree') suspend = true
    else if(step == 'stepFour') suspend = false
    const resumeResult = await run.resume({stepId: step, runId, context: {suspend}})
    let to_get = ''
    if(step == 'stepTwo') to_get = 'stepThree'
    else if(step == 'stepThree') to_get = 'stepFour'
    else if(step == 'stepFour') {
        return {results: resumeResult.results.stepFour.output}
    }
    console.log("CURRENT STEP:", step, " to get: ", to_get)
    const suspended = resumeResult?.activePaths.get(to_get)?.status === 'suspended';
    console.log("SUSPENDED: ", suspended)
    if(suspended) {
        const results = resumeResult?.activePaths.get(to_get)?.suspendPayload;
        console.log(results)
        return { results, step: to_get, runId }
    }
    return { success: true };
}
