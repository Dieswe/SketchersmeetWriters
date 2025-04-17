import { useState, useEffect } from "react";
import Header from "@/components/header";
import RoleSelector from "@/components/role-selector";
import PromptFeed from "@/components/prompt-feed";
import PreviousCollaborations from "@/components/previous-collaborations";
import PopularPrompts from "@/components/popular-prompts";
import UploadModal from "@/components/upload-modal";
import SuccessOverlay from "@/components/success-overlay";
import { Prompt, UserRole, Collaboration } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { useRoleStore } from "@/hooks/use-role";
import { queryClient } from "@/lib/queryClient";
import Confetti from "@/components/confetti";

export default function Home() {
  const { role } = useRoleStore();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);

  // Dynamische query op basis van de geselecteerde rol
  const roleType = role === UserRole.Writer ? 'sketcher' : 'writer';
  
  const { data: prompts = [] } = useQuery<Prompt[]>({
    queryKey: ['/api/prompts', roleType],
    queryFn: async () => {
      const response = await fetch(`/api/prompts?role=${roleType}`);
      if (!response.ok) {
        throw new Error('Fout bij het ophalen van prompts');
      }
      return response.json();
    },
    staleTime: 1000 * 60, // 1 minute
  });
  
  // Invalidate en refetch wanneer de rol verandert
  useEffect(() => {
    if (role) {
      queryClient.invalidateQueries({ 
        queryKey: ['/api/prompts', roleType] 
      });
    }
  }, [role, roleType]);

  const { data: collaborations = [] } = useQuery<Collaboration[]>({
    queryKey: ['/api/collaborations'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { data: popularPrompts = [] } = useQuery<Prompt[]>({
    queryKey: ['/api/prompts/popular'],
    staleTime: 1000 * 60 * 15, // 15 minutes
  });

  const handleUploadClick = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setShowUploadModal(true);
  };

  const handleSubmitUpload = () => {
    setShowUploadModal(false);
    setShowConfetti(true);
    
    // Show success overlay after a slight delay to allow confetti to start
    setTimeout(() => {
      setShowSuccessOverlay(true);
    }, 300);
  };

  const handleCloseSuccess = () => {
    setShowSuccessOverlay(false);
    setShowConfetti(false);
  };

  return (
    <div className="min-h-screen bg-primary/90">
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <Header />
        <RoleSelector />
        
        <div className="mb-12">
          <PromptFeed
            prompts={prompts}
            onUploadClick={handleUploadClick}
          />
        </div>
        
        <PreviousCollaborations collaborations={collaborations} />
        
        <PopularPrompts prompts={popularPrompts} />
      </div>
      
      {showUploadModal && (
        <UploadModal
          prompt={selectedPrompt}
          onClose={() => setShowUploadModal(false)}
          onSubmit={handleSubmitUpload}
        />
      )}
      
      {showSuccessOverlay && (
        <SuccessOverlay onClose={handleCloseSuccess} />
      )}
      
      {showConfetti && <Confetti />}
    </div>
  );
}
