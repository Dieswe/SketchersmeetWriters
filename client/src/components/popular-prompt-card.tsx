import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Prompt, UserRole } from "@/lib/types";
import { motion } from "framer-motion";

interface PopularPromptCardProps {
  prompt: Prompt;
}

export default function PopularPromptCard({ prompt }: PopularPromptCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <Link to={`/submissions/${prompt.id}`}>
        <Card 
          className="shadow-md overflow-hidden cursor-pointer" 
          role="button"
          tabIndex={0}
          onKeyDown={e => { if (e.key === 'Enter') { window.location.href = `/submissions/${prompt.id}`; } }}
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
            <div 
              className={`text-white text-xs px-2 py-1 rounded-full ${
                prompt.creatorRole === UserRole.Writer ? 'bg-[#4B7BF5]' : 'bg-[#FF8A5B]'
              }`}
            >
              {prompt.creatorRole === UserRole.Writer ? 'Schrijver' : 'Tekenaar'}
            </div>
          </CardHeader>
          <CardContent className="p-4 h-28">
            {prompt.type === 'text' ? (
              <p className="text-sm leading-relaxed overflow-y-auto h-full">
                {prompt.content}
              </p>
            ) : (
              <img 
                src={prompt.content} 
                alt="Prompt afbeelding" 
                className="h-full mx-auto object-contain"
              />
            )}
          </CardContent>
          <CardFooter className="p-3 bg-gray-50 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <span className="text-sm flex items-center gap-1">
                <i className="fas fa-heart text-pink-500" aria-hidden="true"></i>
                {prompt.likes}
              </span>
              <span className="text-sm flex items-center gap-1">
                <i className="fas fa-comment text-gray-500" aria-hidden="true"></i>
                {prompt.comments}
              </span>
            </div>
            <Button
              variant="ghost"
              className={prompt.creatorRole === UserRole.Writer ? 'text-[#4B7BF5]' : 'text-[#FF8A5B]'}
              aria-label="Bekijk prompt"
              onClick={(e) => {
                e.stopPropagation();
                window.location.href = `/submissions/${prompt.id}`;
              }}
            >
              <i className="fas fa-arrow-right" aria-hidden="true"></i>
            </Button>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  );
}
