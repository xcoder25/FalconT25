'use client';
import React, { useState } from 'react'; // Explicitly import React
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles } from 'lucide-react';
import { suggestRecognitionReasons, SuggestRecognitionReasonsInput } from '@/ai/flows/suggest-recognition-reasons';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface AiReasonSuggesterProps {
  onReasonSelect: (reason: string) => void;
}

export function AiReasonSuggester({ onReasonSelect }: AiReasonSuggesterProps) {
  const [keywords, setKeywords] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSuggest = async () => {
    if (!keywords.trim()) {
      setError('Please enter some keywords.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setSuggestions([]);
    try {
      const input: SuggestRecognitionReasonsInput = { keywords };
      const result = await suggestRecognitionReasons(input);
      if (result && result.reasons) {
        setSuggestions(result.reasons);
      } else {
        setError('Received an unexpected response from AI. Please try again.');
      }
    } catch (err) {
      console.error('Error fetching AI suggestions:', err);
      setError('Failed to get suggestions. Please check your connection or try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mt-6 bg-background/30 border-dashed border-primary/50 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-md flex items-center">
          <Sparkles className="w-5 h-5 mr-2 text-primary" />
          Need Inspiration? Try AI!
        </CardTitle>
        <CardDescription className="text-xs">
          Enter keywords about the achievement, and our AI will suggest some recognition reasons.
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="space-y-3">
          <Input
            placeholder="e.g., project completed, team help, innovation"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            disabled={isLoading}
            className="text-sm"
          />
          <Button onClick={handleSuggest} disabled={isLoading || !keywords.trim()} className="w-full sm:w-auto text-xs h-9">
            {isLoading ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <Sparkles className="mr-2 h-3 w-3" />}
            Suggest Reasons
          </Button>
          {error && <p className="text-xs text-destructive mt-1">{error}</p>}
        </div>
      </CardContent>
      {suggestions.length > 0 && (
        <CardFooter className="flex-col items-start pt-0 pb-4">
           <h4 className="font-semibold text-xs mb-1.5">Suggestions:</h4>
           <ul className="space-y-1 w-full">
            {suggestions.map((reason, index) => (
              <li key={index} className="text-xs p-2 rounded-md bg-muted/50 hover:bg-muted flex justify-between items-center">
                <span>{reason}</span>
                <Button
                  variant="link"
                  size="sm"
                  className="ml-2 p-0 h-auto text-xs text-primary hover:underline"
                  onClick={() => onReasonSelect(reason)}
                >
                  Use this
                </Button>
              </li>
            ))}
          </ul>
        </CardFooter>
      )}
    </Card>
  );
}
