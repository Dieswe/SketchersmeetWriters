import { useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion, useAnimation } from "framer-motion";

interface SuccessOverlayProps {
  onClose: () => void;
}

export default function SuccessOverlay({ onClose }: SuccessOverlayProps) {
  const controls = useAnimation();

  useEffect(() => {
    const animateEmoji = async () => {
      await controls.start({
        y: [-20, 0],
        transition: { duration: 0.5, ease: "easeOut" }
      });
    };
    
    animateEmoji();
  }, [controls]);

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-white rounded-lg p-8 max-w-md w-full mx-auto text-center">
        <motion.div 
          className="text-5xl mb-4"
          animate={controls}
        >
          🙌
        </motion.div>
        <h3 className="text-xl font-bold mb-2">
          Geweldig! Jouw creativiteit is nu deel van onze community
        </h3>
        <p className="mb-6 text-gray-600">
          Wil je je bijdrage bewaren of reacties ontvangen?
        </p>
        <Button 
          className="w-full py-3 mb-3 bg-[#FFC73B] text-gray-900 font-medium hover:bg-opacity-90"
          onClick={() => {
            // In a real application, this would redirect to the account creation page
            console.log("Create account clicked");
          }}
        >
          Maak een account aan
        </Button>
        <Button 
          variant="outline"
          className="w-full py-3 border border-gray-300 text-gray-700 hover:bg-gray-100"
          onClick={onClose}
        >
          Terug naar homepage
        </Button>
      </DialogContent>
    </Dialog>
  );
}
