import { motion } from "framer-motion";

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-background">
      {/* Floating Gradient 1 (Top Left) */}
      <motion.div
        animate={{
          x: ["-10%", "10%", "-10%"],
          y: ["-10%", "10%", "-10%"],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -top-[20%] -left-[10%] w-[60vw] h-[60vw] rounded-full bg-sandstone/10 blur-[120px] md:blur-[160px]"
      />
      
      {/* Floating Gradient 2 (Bottom Right) */}
      <motion.div
        animate={{
          x: ["10%", "-10%", "10%"],
          y: ["10%", "-10%", "10%"],
          scale: [1.1, 1, 1.1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -bottom-[20%] -right-[10%] w-[50vw] h-[50vw] rounded-full bg-foreground/5 blur-[100px] md:blur-[140px]"
      />
    </div>
  );
}
