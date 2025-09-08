You are given a task to integrate an existing React component in the codebase

The codebase should support:
- shadcn project structure  
- Tailwind CSS
- Typescript

If it doesn't, provide instructions on how to setup project via shadcn CLI, install Tailwind or Typescript.

Determine the default path for components and styles. 
If default path for components is not /components/ui, provide instructions on why it's important to create this folder
Copy-paste this component to /components/ui folder:
```tsx
gradient-button.tsx
"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const gradientButtonVariants = cva(
  [
    "gradient-button",
    "inline-flex items-center justify-center",
    "rounded-[11px] min-w-[132px] px-9 py-4",
    "text-base leading-[19px] font-[500] text-white",
    "font-sans font-bold",
    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
    "disabled:pointer-events-none disabled:opacity-50",
  ],
  {
    variants: {
      variant: {
        default: "",
        variant: "gradient-button-variant",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface GradientButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof gradientButtonVariants> {
  asChild?: boolean
}

const GradientButton = React.forwardRef<HTMLButtonElement, GradientButtonProps>(
  ({ className, variant, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(gradientButtonVariants({ variant, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
GradientButton.displayName = "GradientButton"

export { GradientButton, gradientButtonVariants }

demo.tsx
import { GradientButton } from "@/components/ui/gradient-button"

function Demo() {
  return (
    <div className="flex gap-8">
      <GradientButton>Get Started</GradientButton>
      <GradientButton variant="variant">Get Started</GradientButton>
    </div>
  )
}

export { Demo }
```

Install NPM dependencies:
```bash
@radix-ui/react-slot, class-variance-authority
```

Extend existing globals.css with this code:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  @property --pos-x {
    syntax: '<percentage>';
    initial-value: 11.14%;
    inherits: false;
  }

  @property --pos-y {
    syntax: '<percentage>';
    initial-value: 140%;
    inherits: false;
  }

  @property --spread-x {
    syntax: '<percentage>';
    initial-value: 150%;
    inherits: false;
  }

  @property --spread-y {
    syntax: '<percentage>';
    initial-value: 180.06%;
    inherits: false;
  }

  @property --color-1 {
    syntax: '<color>';
    initial-value: #000;
    inherits: false;
  }

  @property --color-2 {
    syntax: '<color>';
    initial-value: #08012c;
    inherits: false;
  }

  @property --color-3 {
    syntax: '<color>';
    initial-value: #4e1e40;
    inherits: false;
  }

  @property --color-4 {
    syntax: '<color>';
    initial-value: #70464e;
    inherits: false;
  }

  @property --color-5 {
    syntax: '<color>';
    initial-value: #88394c;
    inherits: false;
  }

  @property --border-angle {
    syntax: '<angle>';
    initial-value: 20deg;
    inherits: true;
  }

  @property --border-color-1 {
    syntax: '<color>';
    initial-value: hsla(340, 75%, 60%, 0.2);
    inherits: true;
  }

  @property --border-color-2 {
    syntax: '<color>';
    initial-value: hsla(340, 75%, 40%, 0.75);
    inherits: true;
  }

  @property --stop-1 {
    syntax: '<percentage>';
    initial-value: 37.35%;
    inherits: false;
  }

  @property --stop-2 {
    syntax: '<percentage>';
    initial-value: 61.36%;
    inherits: false;
  }

  @property --stop-3 {
    syntax: '<percentage>';
    initial-value: 78.42%;
    inherits: false;
  }

  @property --stop-4 {
    syntax: '<percentage>';
    initial-value: 89.52%;
    inherits: false;
  }

  @property --stop-5 {
    syntax: '<percentage>';
    initial-value: 100%;
    inherits: false;
  }
}

@layer components {
  .gradient-button {
    @apply relative appearance-none cursor-pointer;
    background: radial-gradient(
      var(--spread-x) var(--spread-y) at var(--pos-x) var(--pos-y),
      var(--color-1) var(--stop-1),
      var(--color-2) var(--stop-2),
      var(--color-3) var(--stop-3),
      var(--color-4) var(--stop-4),
      var(--color-5) var(--stop-5)
    );
    transition:
      --pos-x 0.5s,
      --pos-y 0.5s,
      --spread-x 0.5s,
      --spread-y 0.5s,
      --color-1 0.5s,
      --color-2 0.5s,
      --color-3 0.5s,
      --color-4 0.5s,
      --color-5 0.5s,
      --border-angle 0.5s,
      --border-color-1 0.5s,
      --border-color-2 0.5s,
      --stop-1 0.5s,
      --stop-2 0.5s,
      --stop-3 0.5s,
      --stop-4 0.5s,
      --stop-5 0.5s;
  }

  .gradient-button::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: 1px;
    background: linear-gradient(
      var(--border-angle),
      var(--border-color-1),
      var(--border-color-2)
    );
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask-composite: exclude;
    pointer-events: none;
  }

  .gradient-button:hover {
    --pos-x: 0%;
    --pos-y: 91.51%;
    --spread-x: 120.24%;
    --spread-y: 103.18%;
    --color-1: #c96287;
    --color-2: #c66c64;
    --color-3: #cc7d23;
    --color-4: #37140a;
    --color-5: #000;
    --border-angle: 190deg;
    --border-color-1: hsla(340, 78%, 90%, 0.1);
    --border-color-2: hsla(340, 75%, 90%, 0.6);
    --stop-1: 0%;
    --stop-2: 8.8%;
    --stop-3: 21.44%;
    --stop-4: 71.34%;
    --stop-5: 85.76%;
  }

  .gradient-button-variant {
    --color-1: #000022;
    --color-2: #1f3f6d;
    --color-3: #469396;
    --color-4: #f1ffa5;
    --border-angle: 200deg;
    --border-color-1: hsla(320, 75%, 90%, 0.6);
    --border-color-2: hsla(320, 50%, 90%, 0.15);
  }

  .gradient-button-variant:hover {
    --pos-x: 0%;
    --pos-y: 95.51%;
    --spread-x: 110.24%;
    --spread-y: 110.2%;
    --color-1: #000020;
    --color-2: #f1ffa5;
    --color-3: #469396;
    --color-4: #1f3f6d;
    --color-5: #000;
    --stop-1: 0%;
    --stop-2: 10%;
    --stop-3: 35.44%;
    --stop-4: 71.34%;
    --stop-5: 90.76%;
    --border-angle: 210deg;
    --border-color-1: hsla(320, 75%, 90%, 0.2);
    --border-color-2: hsla(320, 50%, 90%, 0.75);
  }
}
```

Implementation Guidelines
 1. Analyze the component structure and identify all required dependencies
 2. Review the component's argumens and state
 3. Identify any required context providers or hooks and install them
 4. Questions to Ask
 - What data/props will be passed to this component?
 - Are there any specific state management requirements?
 - Are there any required assets (images, icons, etc.)?
 - What is the expected responsive behavior?
 - What is the best place to use this component in the app?

Steps to integrate
 0. Copy paste all the code above in the correct directories
 1. Install external dependencies
 2. Fill image assets with Unsplash stock images you know exist
 3. Use lucide-react icons for svgs or logos if component requires them
