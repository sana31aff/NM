
'use server';
/**
 * @fileOverview A general-purpose chatbot flow for Aura.
 *
 * - chatbotQuery - A function that handles chatbot interactions.
 * - ChatbotQueryInput - The input type for the chatbotQuery function.
 * - ChatbotQueryOutput - The return type for the chatbotQuery function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatbotQueryInputSchema = z.object({
  question: z.string().describe('The user query or question to the chatbot.'),
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    parts: z.array(z.object({text: z.string()})),
    isUser: z.boolean().describe('True if the role is user. For template use.'),
    isModel: z.boolean().describe('True if the role is model. For template use.'),
  })).optional().describe('Optional conversation history to provide context. Each item should include isUser and isModel flags.'),
});
export type ChatbotQueryInput = z.infer<typeof ChatbotQueryInputSchema>;

const ChatbotQueryOutputSchema = z.object({
  answer: z.string().describe('The chatbot\'s response to the user query.'),
});
export type ChatbotQueryOutput = z.infer<typeof ChatbotQueryOutputSchema>;

export async function chatbotQuery(input: ChatbotQueryInput): Promise<ChatbotQueryOutput> {
  return chatbotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatbotPrompt',
  input: {schema: ChatbotQueryInputSchema},
  output: {schema: ChatbotQueryOutputSchema},
  prompt: `You are AuraChat, a helpful assistant integrated into the Aura AI Energy Optimization application.
Your primary goal is to assist users with their questions related to AI, energy efficiency, the Aura application's features, and general knowledge.
Be concise and informative. If you don't know an answer, say so politely.

{{#if history}}
Conversation History:
{{#each history}}
{{#if this.isUser}}User: {{this.parts.[0].text}}{{/if}}
{{#if this.isModel}}AuraChat: {{this.parts.[0].text}}{{/if}}
{{/each}}
{{/if}}

User Question: {{{question}}}

AuraChat Response:
`,
  config: {
    // Default safety settings are usually fine for a general chatbot.
    // If specific issues arise, they can be configured here.
    // e.g., safetySettings: [{ category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }]
  }
});

const chatbotFlow = ai.defineFlow(
  {
    name: 'chatbotFlow',
    inputSchema: ChatbotQueryInputSchema,
    outputSchema: ChatbotQueryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

