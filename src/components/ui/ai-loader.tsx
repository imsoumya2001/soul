import { cn } from "@/lib/utils";
import { useState } from "react";

interface AILoaderProps {
  text?: string;
  className?: string;
}

export const AILoader = ({ text = "Generating", className }: AILoaderProps) => {
  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <div className="loader-wrapper">
        {text.split('').map((letter, index) => (
          <span 
            key={index} 
            className="loader-letter"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {letter === ' ' ? '\u00A0' : letter}
          </span>
        ))}
        <div className="loader"></div>
      </div>
    </div>
  );
};

export const Component = AILoader;

export default AILoader;