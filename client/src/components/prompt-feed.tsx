import { UserRole, Prompt } from "@/lib/types";
import { useRoleStore } from "@/hooks/use-role";
import ImagePromptCard from "./image-prompt-card";
import TextPromptCard from "./text-prompt-card";

interface PromptFeedProps {
  prompts: Prompt[];
  onUploadClick: (prompt: Prompt) => void;
}

export default function PromptFeed({ prompts, onUploadClick }: PromptFeedProps) {
  const { role } = useRoleStore();

  const getHeaderText = () => {
    if (role === UserRole.Writer) {
      return (
        <>
          <i className="fas fa-paint-brush mr-2" aria-hidden="true"></i>
          Geef deze tekening betekenis met jouw woorden
        </>
      );
    } else {
      return (
        <>
          <i className="fas fa-pen mr-2" aria-hidden="true"></i>
          Breng deze teksten tot leven met jouw tekening
        </>
      );
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-white mb-2">{getHeaderText()}</h2>
      </div>

      <div
        className="flex gap-4 pb-4 mb-8 overflow-x-auto snap-x snap-mandatory"
        role="list"
        aria-label={
          role === UserRole.Writer
            ? "Tekenprompts voor schrijvers"
            : "Tekstprompts voor tekenaars"
        }
        style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(0,0,0,0.2) transparent" }}
      >
        {prompts.map((prompt, index) => {
          if (role === UserRole.Writer) {
            return (
              <ImagePromptCard
                key={prompt.id}
                prompt={prompt}
                isDaily={index === 0}
                onUploadClick={() => onUploadClick(prompt)}
              />
            );
          } else {
            return (
              <TextPromptCard
                key={prompt.id}
                prompt={prompt}
                isDaily={index === 0}
                onUploadClick={() => onUploadClick(prompt)}
              />
            );
          }
        })}
      </div>
    </div>
  );
}
