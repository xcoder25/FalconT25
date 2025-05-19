'use client'; // Added "use client" directive

import type { Recognition, User } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Heart, MessageSquare, Send, ThumbsUp } from 'lucide-react'; // Added ThumbsUp
import React from 'react'; // Explicitly import React

interface RecognitionCardProps {
  recognition: Recognition;
}

export function RecognitionCard({ recognition }: RecognitionCardProps) {
  const [showComments, setShowComments] = React.useState(false);
  const [newComment, setNewComment] = React.useState('');
  const [liked, setLiked] = React.useState(false); // Mock like state

  const handleLike = () => setLiked(!liked);
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    // Mock: Add comment to list (in real app, this would be an API call)
    console.log("New comment:", newComment);
    recognition.comments.push({
        id: `c${recognition.comments.length + 1}`,
        user: { id: 'currentUser', name: 'You', avatarUrl: 'https://placehold.co/40x40.png?text=Me' }, // Mock current user
        text: newComment,
        timestamp: new Date().toISOString()
    });
    setNewComment('');
  };

  return (
    <Card className="w-full shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={recognition.giver.avatarUrl} alt={recognition.giver.name} data-ai-hint="person photo" />
            <AvatarFallback>{recognition.giver.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-base font-semibold">
              {recognition.giver.name} recognized {recognition.receiver.name}
            </CardTitle>
            <CardDescription className="text-xs">
              {new Date(recognition.timestamp).toLocaleString()} for <span className="font-medium text-primary">{recognition.value || 'outstanding work'}</span>
            </CardDescription>
          </div>
           <Avatar className="h-10 w-10 ml-auto">
            <AvatarImage src={recognition.receiver.avatarUrl} alt={recognition.receiver.name} data-ai-hint="person photo" />
            <AvatarFallback>{recognition.receiver.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <p className="text-sm font-semibold mb-1 text-foreground/90">Reason:</p>
        <p className="text-sm text-muted-foreground mb-3 whitespace-pre-wrap">{recognition.reason}</p>
        {recognition.message && (
          <>
            <p className="text-sm font-semibold mb-1 text-foreground/90">Personal Message:</p>
            <blockquote className="text-sm italic border-l-2 border-primary pl-3 py-1 bg-secondary/30 rounded-r-md">
              {recognition.message}
            </blockquote>
          </>
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-3 pt-0">
        <div className="flex space-x-2 w-full">
          <Button variant={liked ? "default" : "outline"} size="sm" onClick={handleLike} className="flex-1 sm:flex-none">
            <ThumbsUp className={`mr-2 h-4 w-4 ${liked ? '' : ''}`} /> {liked ? 'Liked' : 'Like'}
            {recognition.reactions.length > 0 && !liked && <span className="ml-1 text-xs">({recognition.reactions.length})</span>}
            {liked && <span className="ml-1 text-xs">({recognition.reactions.length + 1})</span>}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowComments(!showComments)} className="flex-1 sm:flex-none">
            <MessageSquare className="mr-2 h-4 w-4" /> Comment ({recognition.comments.length})
          </Button>
        </div>
        {showComments && (
          <div className="w-full mt-2 space-y-3">
            <Separator />
            {recognition.comments.length > 0 ? (
              <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
                {recognition.comments.map((comment) => (
                  <div key={comment.id} className="flex items-start space-x-2 text-xs">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={comment.user.avatarUrl} alt={comment.user.name} data-ai-hint="person photo" />
                      <AvatarFallback>{comment.user.name.substring(0,1)}</AvatarFallback>
                    </Avatar>
                    <div className="bg-muted/50 p-2 rounded-md flex-1">
                      <span className="font-semibold">{comment.user.name}</span>
                      <p className="text-muted-foreground whitespace-pre-wrap">{comment.text}</p>
                      <p className="text-muted-foreground/70 text-[10px] mt-0.5">{new Date(comment.timestamp).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No comments yet. Be the first!</p>
            )}
            <form onSubmit={handleCommentSubmit} className="flex items-center space-x-2">
              <Textarea
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="text-xs min-h-[40px] resize-none"
                rows={1}
              />
              <Button type="submit" size="icon" variant="ghost" disabled={!newComment.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
