
import { Mastra } from '@mastra/core/mastra';
import { createLogger } from '@mastra/core/logger';
import { grammarAgent, literaryAgent, readingAgent, rewritingAgent } from './agents';
import { myWorkflow } from './workflows';

export const mastra = new Mastra({
  workflows: { myWorkflow },
  agents: { grammarAgent, literaryAgent, readingAgent, rewritingAgent },
  logger: createLogger({
    name: 'Mastra',
    level: 'info',
  }),
});
