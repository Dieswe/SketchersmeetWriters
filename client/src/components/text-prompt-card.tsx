import PromptCard from "./prompt-card";
import { Prompt } from "@/lib/types";

interface TextPromptCardProps {
  prompt: Prompt;
  isDaily: boolean;
  onUploadClick: () => void;
}

export default function TextPromptCard({ prompt, isDaily, onUploadClick }: TextPromptCardProps) {
  return (
    <PromptCard
      prompt={prompt}
      isDaily={isDaily}
      onUploadClick={onUploadClick}
      buttonText="Upload tekening"
      buttonIcon="fas fa-paint-brush"
      buttonClassName="bg-[#FF8A5B] text-white"
    >
      <div className="p-4 h-48 overflow-y-auto">
        <p className="text-sm leading-relaxed">
          {prompt.content}
        </p>
      </div>
    </PromptCard>
  );
}
