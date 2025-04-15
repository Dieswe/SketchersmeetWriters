import { Prompt } from "@/lib/types";
import PopularPromptCard from "./popular-prompt-card";

interface PopularPromptsProps {
  prompts: Prompt[];
}

export default function PopularPrompts({ prompts }: PopularPromptsProps) {
  return (
    <section className="mb-12">
      <h2 className="text-xl font-semibold text-white mb-6">Populaire prompts</h2>
      
      <div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        role="list"
        aria-label="Populaire prompts"
      >
        {prompts.map((prompt) => (
          <PopularPromptCard key={prompt.id} prompt={prompt} />
        ))}
      </div>
    </section>
  );
}
