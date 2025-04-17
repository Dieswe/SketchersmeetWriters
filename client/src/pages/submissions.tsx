import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import SubmissionCard from "@/components/submission-card";
import UploadModal from "@/components/upload-modal";
import SuccessOverlay from "@/components/success-overlay";
import Confetti from "@/components/confetti";
import { Prompt, UserRole, Submission } from "@/lib/types";
import { X, ArrowLeft } from "lucide-react";

export default function Submissions() {
  const { promptId } = useParams();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const { data: prompt, isLoading: isPromptLoading } = useQuery<Prompt>({
    queryKey: ['/api/prompts', promptId],
  });

  const { data: submissions = [], isLoading: isSubmissionsLoading } = useQuery<Submission[]>({
    queryKey: ['/api/prompts', promptId, 'submissions'],
    enabled: !!promptId,
  });

  const handleSubmitUpload = () => {
    setShowUploadModal(false);
    setShowConfetti(true);
    
    // Show success overlay after a slight delay
    setTimeout(() => {
      setShowSuccessOverlay(true);
    }, 300);
  };

  const handleCloseSuccess = () => {
    setShowSuccessOverlay(false);
    setShowConfetti(false);
  };

  if (isPromptLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#10998A" }}>
        <div className="text-white">Laden...</div>
      </div>
    );
  }

  if (!prompt) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: "#10998A" }}>
        <div className="text-white text-xl mb-4">Prompt niet gevonden</div>
        <Link href="/">
          <Button variant="outline" className="text-white border-white hover:bg-white/10">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Terug naar startpagina
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#10998A" }}>
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="flex justify-between items-center mb-6">
          <Link href="/">
            <Button variant="ghost" className="text-white hover:text-gray-200">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Terug
            </Button>
          </Link>
          <h2 className="text-xl font-bold text-white">Inzendingen</h2>
          <Link href="/">
            <Button variant="ghost" className="text-white hover:text-gray-200 p-2">
              <X className="h-5 w-5" />
            </Button>
          </Link>
        </div>

        {/* Original Prompt */}
        <Card className="mb-6 overflow-hidden shadow-md">
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
          <CardContent className="p-4">
            {prompt.type === 'text' ? (
              <p className="text-sm leading-relaxed">{prompt.content}</p>
            ) : (
              <img 
                src={prompt.content} 
                alt="Prompt afbeelding" 
                className="w-full max-h-96 object-contain mx-auto" 
              />
            )}
          </CardContent>
          <CardFooter className="p-4 bg-gray-50 flex justify-between items-center">
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
            <Button variant="ghost" className="text-[#1BAA9B] hover:text-opacity-80">
              <i className="fas fa-share-alt" aria-hidden="true"></i>
            </Button>
          </CardFooter>
        </Card>

        {/* No submissions message */}
        {submissions.length === 0 && !isSubmissionsLoading && (
          <Card className="p-8 text-center mb-6 shadow-md">
            <div className="text-4xl mb-4">🎉</div>
            <h3 className="text-xl font-bold mb-2">
              Yes! Jij bent de eerste. Laat je creativiteit de vrije loop!
            </h3>
            <Button 
              className="mt-4 px-6 py-3 inline-flex items-center gap-2 hover:bg-opacity-90"
              style={{ 
                backgroundColor: prompt.creatorRole === UserRole.Writer ? '#FF8A5B' : '#4B7BF5',
                color: 'white' 
              }}
              onClick={() => setShowUploadModal(true)}
            >
              <i className={`fas ${prompt.creatorRole === UserRole.Writer ? 'fa-paint-brush' : 'fa-pen'}`} aria-hidden="true"></i>
              <span>Upload jouw bijdrage</span>
            </Button>
          </Card>
        )}

        {/* Submissions list */}
        {submissions.length > 0 && (
          <div className="space-y-6">
            {submissions.map((submission) => (
              <SubmissionCard 
                key={submission.id} 
                submission={submission}
                isOwnSubmission={submission.creator.id === 'current-user'}
              />
            ))}
            
            {/* Button to add another contribution */}
            <div className="flex justify-center mt-6">
              <Button
                onClick={() => setShowUploadModal(true)}
                className="px-6 py-3 inline-flex items-center gap-2 hover:bg-opacity-90"
                style={{ backgroundColor: '#FFC73B', color: '#000000' }}
              >
                <i className={`fas ${prompt.creatorRole === UserRole.Writer ? 'fa-paint-brush' : 'fa-pen'}`} aria-hidden="true"></i>
                <span>Upload nog een bijdrage</span>
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {showUploadModal && (
        <UploadModal
          prompt={prompt}
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
