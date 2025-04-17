import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Prompt, UserRole } from "@/lib/types";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

interface UploadModalProps {
  prompt: Prompt | null;
  onClose: () => void;
  onSubmit: () => void;
}

export default function UploadModal({ prompt, onClose, onSubmit }: UploadModalProps) {
  const [storyText, setStoryText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  if (!prompt) return null;

  // Gebruik naam vanuit gebruikerflow: tekenen bij een tekstprompt
  const isUploadingDrawing = prompt.type === 'text';
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Display image preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  function handleChooseFile() {
    fileInputRef.current?.click();  // veilig null-check
  };

  const handleSubmit = async () => {
    if (!isUploadingDrawing && !storyText.trim()) {
      toast({
        title: "Fout",
        description: "Je moet een verhaal schrijven voordat je kunt uploaden.",
        variant: "destructive",
      });
      return;
    }

    if (isUploadingDrawing && !previewUrl) {
      toast({
        title: "Fout",
        description: "Je moet een afbeelding uploaden voordat je kunt doorgaan.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);
      
      // In a real application, we would upload the file to a server here
      // For now, we'll simulate a delay
      const submissionData = {
        promptId: parseInt(prompt.id),  // ID als nummer doorgeven
        userId: 1,                      // Gebruiker 1 (test gebruiker)
        type: isUploadingDrawing
          ? 'image'                     // tekenupload
          : 'text',                     // tekstupload
        content: isUploadingDrawing
          ? previewUrl || ""            // Fallback naar lege string
          : storyText
      };
      
      await apiRequest('POST', '/api/submissions', submissionData);
      
      // Invalidate relevant queries to refetch data
      await queryClient.invalidateQueries({
        queryKey: ['/api/prompts', prompt.id, 'submissions'],
      });
      
      onSubmit();
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Fout bij uploaden",
        description: "Er is iets misgegaan. Probeer het opnieuw.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Upload jouw creatieve bijdrage
          </DialogTitle>
        </DialogHeader>

        {!isUploadingDrawing ? (
          <div>
            <Label htmlFor="story-text" className="block text-sm font-medium mb-2">
              Jouw verhaal
            </Label>
            <Textarea
              id="story-text"
              rows={6}
              className="w-full"
              placeholder="Schrijf hier jouw verhaal bij de tekening..."
              value={storyText}
              onChange={(e) => setStoryText(e.target.value)}
            />
          </div>
        ) : (
          <div>
            <Label htmlFor="drawing-upload" className="block text-sm font-medium mb-2">
              Jouw tekening
            </Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              {previewUrl && (
                <div className="mb-4">
                  <img
                    src={previewUrl}
                    alt="Preview van jouw tekening"
                    className="max-h-48 mx-auto"
                  />
                </div>
              )}
              <Button
                type="button"
                onClick={handleChooseFile}
                className="bg-[#FF8A5B] text-white hover:bg-opacity-90"
              >
                <i className="fas fa-upload mr-2" aria-hidden="true"></i>
                <span>Kies bestand</span>
              </Button>
              <Input
                ref={fileInputRef}
                type="file"
                id="drawing-upload"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
              <p className="mt-2 text-sm text-gray-500">JPG, PNG of GIF (max. 5MB)</p>
            </div>
          </div>
        )}

        <DialogFooter className="flex justify-end gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="border border-gray-300"
          >
            Annuleren
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isUploading}
            className="bg-[#FFC73B] text-gray-900 font-medium hover:bg-opacity-90 focus:ring-[#FFC73B]"
          >
            {isUploading ? "Bezig met uploaden..." : "Uploaden"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
