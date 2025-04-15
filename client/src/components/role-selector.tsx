import { useRoleStore } from "@/hooks/use-role";
import { UserRole } from "@/lib/types";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function RoleSelector() {
  const { role, setRole } = useRoleStore();
  const [mounted, setMounted] = useState(false);

  // Set default role to Writer on initial mount
  useEffect(() => {
    if (!mounted) {
      setMounted(true);
      if (!role) {
        setRole(UserRole.Writer);
      }
    }
  }, [mounted, role, setRole]);

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
  };

  return (
    <div className="flex justify-center gap-4 mb-8">
      <motion.div
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.05 }}
      >
        <Button
          variant="ghost"
          className={`flex items-center gap-2 px-6 py-3 rounded-full shadow-md transition-all ${
            role === UserRole.Writer
              ? "bg-[#4B7BF5] text-white"
              : "bg-white text-[#4B7BF5] border border-[#4B7BF5]"
          }`}
          onClick={() => handleRoleChange(UserRole.Writer)}
          aria-pressed={role === UserRole.Writer}
          role="tab"
        >
          <i className="fas fa-pen" aria-hidden="true"></i>
          <span>Voor schrijvers</span>
        </Button>
      </motion.div>

      <motion.div
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.05 }}
      >
        <Button
          variant="ghost"
          className={`flex items-center gap-2 px-6 py-3 rounded-full shadow-md transition-all ${
            role === UserRole.Sketcher
              ? "bg-[#FF8A5B] text-white"
              : "bg-white text-[#FF8A5B] border border-[#FF8A5B]"
          }`}
          onClick={() => handleRoleChange(UserRole.Sketcher)}
          aria-pressed={role === UserRole.Sketcher}
          role="tab"
        >
          <i className="fas fa-paint-brush" aria-hidden="true"></i>
          <span>Voor tekenaars</span>
        </Button>
      </motion.div>
    </div>
  );
}
