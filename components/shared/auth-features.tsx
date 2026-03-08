"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";

export const AuthFeatures = ({ type }: { type: "login" | "register" }) => {
  const [index, setIndex] = useState(0);
  const t = useTranslations("Auth.features");
  
  const features = t.raw(type);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % features.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [features.length]);

  return (
    <div className="relative h-full flex flex-col justify-center px-16 text-white max-w-2xl overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -100, opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="space-y-8"
        >
          <h2 className="text-5xl font-bold leading-tight">
            {features[index].title}
          </h2>
          
          <p className="text-xl text-primary-foreground/70">
            {features[index].description}
          </p>

          {type === "login" ? (
            <ul className="space-y-6">
              {features[index].points?.map((text: string, i: number) => (
                <li key={i} className="flex items-center gap-4 text-lg text-primary-foreground/90">
                  <div className="bg-white/20 p-1 rounded-full shrink-0">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  {text}
                </li>
              ))}
            </ul>
          ) : (
            <div className="space-y-8">
              {features[index].steps?.map((step: any, i: number) => (
                <div key={i} className="flex gap-4">
                  <div className="bg-primary/20 h-12 w-12 rounded-xl flex items-center justify-center shrink-0">
                    <span className="text-xl font-bold text-primary-foreground">{i + 1}</span>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-1">{step.title}</h4>
                    <p className="text-slate-400">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Progress indicators */}
      <div className="absolute bottom-16 left-16 flex gap-2">
        {features.map((_, i) => (
          <div 
            key={i}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              index === i ? "w-8 bg-white" : "w-2 bg-white/30"
            )}
          />
        ))}
      </div>
    </div>
  );
};

// Simple cn helper if needed or import from lib
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}

