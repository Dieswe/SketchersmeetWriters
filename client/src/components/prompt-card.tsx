import { useCallback } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Prompt } from "@/lib/types";
import { motion } from "framer-motion";

interface PromptCardProps {
  prompt: Prompt;
  isDaily: boolean;
  onUploadClick: () => void;
  children: React.ReactNode;
  buttonText: string;
  buttonIcon: string;
  buttonClassName: string;
}

export default function PromptCard({
  prompt,
  isDaily,
  onUploadClick,
  children,
  buttonText,
  buttonIcon,
  buttonClassName,
}: PromptCardProps) {
  const handleCardClick = useCallback((e?: React.KeyboardEvent | React.MouseEvent) => {
    // Function for keyboard/mouse handlers
    if (e) {
      e.preventDefault();
    }
    window.location.href = `/submissions/${prompt.id}`;
  }, [prompt.id]);

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className={`relative flex-shrink-0 w-72 overflow-hidden ${isDaily ? "daily-prompt" : ""}`}
    >
      {isDaily && (
        <div 
          className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#FFC73B] text-black px-2 py-1 rounded-md text-xs font-semibold z-10"
        >
          Vandaag
        </div>
      )}
      <Link to={`/submissions/${prompt.id}`}>
        <Card
          className="h-full shadow-md cursor-pointer overflow-hidden min-w-[250px] flex-shrink-0"
          role="button"
          tabIndex={0}
          onKeyDown={e => { if (e.key === 'Enter') { handleCardClick(); } }}
          aria-label="Bekijk inzendingen van deze prompt"
        >
          <CardHeader className="p-3 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                {prompt.creator.avatar && (
                  <img 
                    src={prompt.creator.avatar} 
                    alt="" 
                    className="w-full h-full object-cover" 
                  />
                )}
              </div>
              <span className="font-medium">{prompt.creator.name}</span>
            </div>
            {prompt.isActive && (
              <div 
                className="w-2 h-2 rounded-full bg-[#4CAF50] animate-pulse"
                title="Active now"
              />
            )}
          </CardHeader>
          
          <CardContent className="p-0">
            {children}
          </CardContent>
          
          <CardFooter className="p-4">
            <div className="w-full">
              <div className="flex justify-between mb-4 text-sm text-muted">
                <span>{prompt.contributionsCount} bijdragen</span>
                <span>{prompt.commentsCount} reacties</span>
              </div>
              <Button 
                className={`w-full py-2 flex items-center justify-center gap-2 hover:bg-opacity-90 transition ${buttonClassName}`}
                aria-label={buttonText}
                onClick={(e) => {
                  e.stopPropagation();
                  onUploadClick();
                }}
              >
                <i className={buttonIcon} aria-hidden="true"></i>
                <span>{buttonText}</span>
              </Button>
            </div>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  );
}
