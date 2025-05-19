'use server';

/**
 * @fileOverview An AI agent that suggests recognition reasons based on keywords.
 *
 * - suggestRecognitionReasons - A function that suggests recognition reasons.
 * - SuggestRecognitionReasonsInput - The input type for the suggestRecognitionReasons function.
 * - SuggestRecognitionReasonsOutput - The return type for the suggestRecognitionReasons function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestRecognitionReasonsInputSchema = z.object({
  keywords: z
    .string()
    .describe('Keywords related to the achievement or behavior to be recognized.'),
});
export type SuggestRecognitionReasonsInput = z.infer<
  typeof SuggestRecognitionReasonsInputSchema
>;

const SuggestRecognitionReasonsOutputSchema = z.object({
  reasons: z
    .array(z.string())
    .describe('A list of suggested recognition reasons or phrases.'),
});
export type SuggestRecognitionReasonsOutput = z.infer<
  typeof SuggestRecognitionReasonsOutputSchema
>;

export async function suggestRecognitionReasons(
  input: SuggestRecognitionReasonsInput
): Promise<SuggestRecognitionReasonsOutput> {
  return suggestRecognitionReasonsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestRecognitionReasonsPrompt',
  input: {schema: SuggestRecognitionReasonsInputSchema},
  output: {schema: SuggestRecognitionReasonsOutputSchema},
  prompt: `You are a helpful assistant that suggests recognition reasons or phrases based on keywords.

  Based on the following keywords, suggest 3 different recognition reasons or phrases that would be appropriate:

  Keywords: {{{keywords}}}

  Please return the reasons as a JSON array of strings.
  `,
});

const suggestRecognitionReasonsFlow = ai.defineFlow(
  {
    name: 'suggestRecognitionReasonsFlow',
    inputSchema: SuggestRecognitionReasonsInputSchema,
    outputSchema: SuggestRecognitionReasonsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
