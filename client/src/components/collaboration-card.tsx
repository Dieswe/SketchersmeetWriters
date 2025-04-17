import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Collaboration } from "@/lib/types";
import { motion } from "framer-motion";

interface CollaborationCardProps {
  collaboration: Collaboration;
}

export default function CollaborationCard({ collaboration }: CollaborationCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="flex-shrink-0 w-80 sm:w-96"
    >
      <Link to={`/submissions/${collaboration.promptId}`}>
        <Card 
          className="bg-white/10 p-4 rounded-xl hover:bg-white/20 shadow-md overflow-hidden h-full cursor-pointer transition" 
          role="button"
          tabIndex={0}
          onKeyDown={e => { if (e.key === 'Enter') { window.location.href = `/submissions/${collaboration.promptId}`; } }}
          aria-label="Bekijk inzendingen van deze prompt"
        >
          <CardContent className="p-0">
            <div className="flex flex-col sm:flex-row h-full">
              <div className="w-full sm:w-1/2">
                <img 
                  src={collaboration.image.startsWith('http') ? collaboration.image : `https://images.unsplash.com/photo-1618331835717-801e976710b2`} 
                  alt={collaboration.imageAlt || "Illustratie"}
                  className="w-full h-48 object-cover rounded-lg" 
                />
              </div>
              <div className="w-full sm:w-1/2 p-4 flex flex-col">
                <p className="text-white text-sm flex-grow overflow-y-auto">
                  {collaboration.text}
                </p>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {collaboration.collaborators.map((collaborator, index) => (
                        <div 
                          key={index} 
                          className="w-6 h-6 rounded-full border-2 border-white overflow-hidden"
                        >
                          {collaborator.avatar ? (
                            <img 
                              src={collaborator.avatar.startsWith('http') ? collaborator.avatar : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde'} 
                              alt="" 
                              className="w-full h-full object-cover" 
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                              <i className="fas fa-user text-gray-500 text-xs"></i>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <span className="text-xs text-gray-300">
                      {collaboration.collaborators.length} samenwerkingen
                    </span>
                  </div>
                  <Button 
                    variant="ghost" 
                    className="text-[#4B7BF5] hover:bg-white/10"
                    aria-label="Bekijk samenwerking"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = `/submissions/${collaboration.promptId}`;
                    }}
                  >
                    <i className="fas fa-arrow-right" aria-hidden="true"></i>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
