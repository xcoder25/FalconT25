
'use server';
/**
 * @fileOverview An AI agent that generates performance highlights based on recognitions.
 *
 * - generatePerformanceHighlights - A function that generates performance highlights.
 * - GeneratePerformanceHighlightsInput - The input type for the function.
 * - GeneratePerformanceHighlightsOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePerformanceHighlightsInputSchema = z.object({
  staffName: z.string().describe("The name of the staff member."),
  recognitionDetails: z
    .array(z.string())
    .describe('A list of strings, each describing a recognition received by the staff member (e.g., "Recognized for Team Player: Was incredibly helpful...").'),
});
export type GeneratePerformanceHighlightsInput = z.infer<
  typeof GeneratePerformanceHighlightsInputSchema
>;

const GeneratePerformanceHighlightsOutputSchema = z.object({
  highlights: z
    .array(z.string())
    .describe('A list of bullet-point style performance highlights.'),
});
export type GeneratePerformanceHighlightsOutput = z.infer<
  typeof GeneratePerformanceHighlightsOutputSchema
>;

export async function generatePerformanceHighlights(
  input: GeneratePerformanceHighlightsInput
): Promise<GeneratePerformanceHighlightsOutput> {
  // Ensure there are recognition details to process
  if (!input.recognitionDetails || input.recognitionDetails.length === 0) {
    return { highlights: ["No recognition details provided to generate highlights."] };
  }
  return generatePerformanceHighlightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePerformanceHighlightsPrompt',
  input: {schema: GeneratePerformanceHighlightsInputSchema},
  output: {schema: GeneratePerformanceHighlightsOutputSchema},
  prompt: `You are an expert HR assistant tasked with summarizing an employee's positive contributions.
Based on the following recognitions received by {{staffName}}, please generate 3-5 concise bullet points highlighting their key strengths, positive contributions, and impact.
Focus on action verbs and concrete examples derived from the provided texts.

Recognitions for {{staffName}}:
{{#each recognitionDetails}}
- "{{this}}"
{{/each}}

Return the highlights as a JSON array of strings. For example: ["Demonstrated strong leadership by mentoring junior team members.", "Showcased excellent problem-solving skills in resolving critical client issue X."].
If no specific actions or impacts are detailed in the recognitions, provide general positive statements based on the recognition values or reasons given.
`,
});

const generatePerformanceHighlightsFlow = ai.defineFlow(
  {
    name: 'generatePerformanceHighlightsFlow',
    inputSchema: GeneratePerformanceHighlightsInputSchema,
    outputSchema: GeneratePerformanceHighlightsOutputSchema,
  },
  async input => {
    if (!input.recognitionDetails || input.recognitionDetails.length === 0) {
      return { highlights: ["No recognition data available to generate highlights for this staff member."] };
    }
    const {output} = await prompt(input);
    if (!output || !output.highlights || output.highlights.length === 0) {
        return { highlights: ["AI could not generate highlights based on the provided recognitions. They may lack specific details."] };
    }
    return output!;
  }
);
