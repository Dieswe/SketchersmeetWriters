import { Collaboration } from "@/lib/types";
import CollaborationCard from "./collaboration-card";

interface PreviousCollaborationsProps {
  collaborations: Collaboration[];
}

export default function PreviousCollaborations({ collaborations }: PreviousCollaborationsProps) {
  // Log voor debugging
  console.log("PreviousCollaborations rendering met:", { collaborationsCount: collaborations.length });

  return (
    <section className="mb-12">
      <h2 className="text-xl font-semibold text-primary-foreground mb-6">Eerdere samenwerkingen</h2>
      
      <div 
        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 px-4"
        role="list"
        aria-label="Eerdere samenwerkingen"
        style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(0,0,0,0.2) transparent" }}
      >
        {collaborations.length > 0 ? (
          collaborations.map((collaboration) => (
            <CollaborationCard key={collaboration.id} collaboration={collaboration} />
          ))
        ) : (
          <div className="text-muted text-center p-4 col-span-full">
            Geen eerdere samenwerkingen gevonden
          </div>
        )}
      </div>
    </section>
  );
}
