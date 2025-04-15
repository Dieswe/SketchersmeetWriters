import { useState } from "react";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Submission } from "@/lib/types";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface SubmissionCardProps {
  submission: Submission;
  isOwnSubmission: boolean;
}

export default function SubmissionCard({ submission, isOwnSubmission }: SubmissionCardProps) {
  const [isLiked, setIsLiked] = useState(submission.isLiked);
  const [likesCount, setLikesCount] = useState(submission.likes);
  const { toast } = useToast();

  const handleLike = async () => {
    try {
      // Toggle like status
      const newLikeStatus = !isLiked;
      
      // Optimistic update
      setIsLiked(newLikeStatus);
      setLikesCount(prev => newLikeStatus ? prev + 1 : prev - 1);
      
      // Make API request
      await apiRequest('POST', `/api/submissions/${submission.id}/like`, {
        liked: newLikeStatus
      });
      
      // Invalidate query to refresh data
      await queryClient.invalidateQueries({
        queryKey: ['/api/prompts', submission.promptId, 'submissions'],
      });
    } catch (error) {
      // Revert optimistic update on error
      setIsLiked(!isLiked);
      setLikesCount(prev => isLiked ? prev + 1 : prev - 1);
      
      toast({
        title: "Fout",
        description: "Er is iets misgegaan bij het liken van deze bijdrage.",
        variant: "destructive",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        className={`shadow-md overflow-hidden ${
          isOwnSubmission ? "border-2 border-[#FFC73B]" : ""
        }`}
      >
        <CardHeader className="p-3 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isOwnSubmission ? (
              <>
                <span className="font-medium">Jouw bijdrage</span>
                <div className="bg-[#FFC73B] text-xs px-2 py-1 rounded-full text-gray-900">Jij</div>
              </>
            ) : (
              <>
                <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                  {submission.creator.avatar && (
                    <img 
                      src={submission.creator.avatar} 
                      alt="" 
                      className="w-full h-full object-cover" 
                    />
                  )}
                </div>
                <span className="font-medium">{submission.creator.name}</span>
              </>
            )}
          </div>
          <span className="text-sm text-muted">
            {isOwnSubmission ? "Zojuist geplaatst" : submission.timeAgo}
          </span>
        </CardHeader>
        <CardContent className="p-4">
          {submission.type === 'text' ? (
            <p className="text-sm leading-relaxed">{submission.content}</p>
          ) : (
            <img 
              src={submission.content} 
              alt="Ingezonden illustratie" 
              className="max-h-96 mx-auto object-contain" 
            />
          )}
        </CardContent>
        <CardFooter className="p-4 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              className={`hover:text-pink-500 transition flex items-center gap-1 ${
                isLiked ? "text-pink-500" : "text-muted"
              }`}
              aria-label={isLiked ? "Unlike deze bijdrage" : "Like deze bijdrage"}
              onClick={handleLike}
            >
              <i className={`${isLiked ? "fas" : "far"} fa-heart`} aria-hidden="true"></i>
              <span>{likesCount}</span>
            </Button>
            <Button
              variant="ghost"
              className="text-muted hover:text-gray-700 transition flex items-center gap-1"
              aria-label="Reageer op deze bijdrage"
            >
              <i className="far fa-comment" aria-hidden="true"></i>
              <span>{submission.comments}</span>
            </Button>
          </div>
          <Button
            variant="ghost"
            className="text-muted hover:text-[#1BAA9B] transition"
            aria-label="Deel deze bijdrage"
          >
            <i className="fas fa-share-alt" aria-hidden="true"></i>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
