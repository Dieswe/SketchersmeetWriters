import PromptCard from "./prompt-card";
import { Prompt } from "@/lib/types";

interface ImagePromptCardProps {
  prompt: Prompt;
  isDaily: boolean;
  onUploadClick: () => void;
}

export default function ImagePromptCard({ prompt, isDaily, onUploadClick }: ImagePromptCardProps) {
  return (
    <PromptCard
      prompt={prompt}
      isDaily={isDaily}
      onUploadClick={onUploadClick}
      buttonText="Schrijf verhaal bij deze tekening"
      buttonIcon="fas fa-pen"
      buttonClassName="bg-[#4B7BF5] text-white"
    >
      <img 
        src={prompt.content.startsWith('http') || prompt.content.startsWith('/uploads/') ? prompt.content : `https://images.unsplash.com/photo-1618331835717-801e976710b2`}
        alt="Tekening prompt" 
        className="w-full h-48 object-cover"
      />
    </PromptCard>
  );
}
