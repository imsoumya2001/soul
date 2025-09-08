import React from "react";

import { cn } from "@/lib/utils";
interface RainbowButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function RainbowButton({
  children,
  className,
  ...props
}: RainbowButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-11 items-center justify-center rounded-xl px-8 py-2 font-medium text-white",
        "bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900",
        "hover:from-gray-800 hover:via-gray-700 hover:to-gray-800",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        "disabled:pointer-events-none disabled:opacity-50",
        "transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]",
        "shadow-sm hover:shadow-md text-sm sm:text-base",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}