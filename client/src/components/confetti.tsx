import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface ConfettiPieceProps {
  left: string;
  backgroundColor: string;
  opacity: number;
  width: string;
  height: string;
  rotate: number;
  delay: number;
}

const ConfettiPiece = ({
  left,
  backgroundColor,
  opacity,
  width,
  height,
  rotate,
  delay,
}: ConfettiPieceProps) => {
  return (
    <motion.div
      style={{
        position: "absolute",
        left,
        backgroundColor,
        opacity,
        width,
        height,
        transform: `rotate(${rotate}deg)`,
        top: "-5%",
      }}
      initial={{ top: "-5%" }}
      animate={{ 
        top: "105%",
        x: Math.random() > 0.5 ? 100 : -100,
        rotate: rotate + 360
      }}
      transition={{ 
        duration: Math.random() * 3 + 2,
        delay,
        ease: "linear" 
      }}
      className="rounded-full"
    />
  );
};

export default function Confetti() {
  const [pieces, setPieces] = useState<ConfettiPieceProps[]>([]);
  
  useEffect(() => {
    const colors = ["#FFC73B", "#4B7BF5", "#FF8A5B", "#1BAA9B", "#4CAF50"];
    const newPieces: ConfettiPieceProps[] = [];
    
    // Create 100 confetti pieces
    for (let i = 0; i < 100; i++) {
      newPieces.push({
        left: `${Math.random() * 100}vw`,
        backgroundColor: colors[Math.floor(Math.random() * colors.length)],
        opacity: Math.random() + 0.2,
        width: `${Math.random() * 15 + 5}px`,
        height: `${Math.random() * 15 + 5}px`,
        rotate: Math.random() * 360,
        delay: Math.random() * 0.5,
      });
    }
    
    setPieces(newPieces);
    
    // Remove confetti after 2 seconds
    const timer = setTimeout(() => {
      setPieces([]);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div 
      className="fixed inset-0 z-50 pointer-events-none"
      aria-hidden="true"
    >
      {pieces.map((piece, index) => (
        <ConfettiPiece key={index} {...piece} />
      ))}
    </div>
  );
}
