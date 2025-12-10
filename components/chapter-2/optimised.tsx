"use client";

import { useState, ReactNode } from "react";
import { CodeBlock } from "@/components/ui/code-block";

// VerySlowComponent - simulates a slow rendering component
const VerySlowComponent = () => {
  // Simulate slow rendering by doing some heavy computation
  const startTime = performance.now();
  while (performance.now() - startTime < 100) {
    // Artificial delay - blocking for 100ms
  }

  return (
    <div className="mt-6 rounded-lg border border-dashed border-amber-500/50 bg-amber-500/10 p-6">
      <h3 className="text-lg font-semibold text-amber-600 dark:text-amber-400">
        🐢 VerySlowComponent
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">
        This component takes ~100ms to render. Notice how it does NOT re-render
        when you move your mouse because it&apos;s passed as children!
      </p>
      <p className="mt-2 text-xs text-amber-600/70 dark:text-amber-400/70">
        Rendered at: {new Date().toLocaleTimeString()}
      </p>
    </div>
  );
};

// Optimised: MovingBlock accepts children as props
// Children are created in a different scope, so they don't re-render
type MovingBlockProps = {
  children?: ReactNode;
};

const MovingBlock = ({ children }: MovingBlockProps) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      className="relative h-64 w-full cursor-crosshair rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900"
      onMouseMove={handleMouseMove}
      role="region"
      aria-label="Mouse tracking area"
    >
      {/* The moving dot that follows cursor */}
      <div
        className="pointer-events-none absolute h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500 shadow-lg transition-none"
        style={{
          left: position.x,
          top: position.y,
        }}
        aria-hidden="true"
      />

      {/* Position indicator */}
      <div className="absolute bottom-3 left-3 rounded bg-zinc-800/80 px-2 py-1 text-xs text-white">
        x: {Math.round(position.x)}, y: {Math.round(position.y)}
      </div>

      {/* Instructions */}
      <div className="absolute left-1/2 top-4 -translate-x-1/2 text-sm text-muted-foreground">
        Move your mouse here
      </div>

      {/* Children are passed from outside - they won't re-render! */}
      <div className="absolute bottom-3 right-3">
        {children}
      </div>
    </div>
  );
};

// Main component for Chapter 2 - Optimised
const ChapterTwoOptimised = () => {
  return (
    <div className="layout mx-auto max-w-2xl p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Chapter 2: Elements, Children as Props (Optimised)</h1>
        <p className="mt-2 text-muted-foreground">
          This example demonstrates how passing components as children prevents
          unnecessary re-renders.
        </p>
        <div className="mt-6">
            <CodeBlock 
                fileName="components/chapter-2/optimised.tsx"
                code={`
const MovingBlock = ({ children }) => {
  // State changes here...
  return (
    <div onMouseMove={handleMouseMove}>
      {/* 
         'children' is passed as a prop. 
         React knows that the 'children' prop hasn't changed 
         (it's the same object reference from the parent), 
         so it doesn't need to re-render the children!
      */}
      {children}
    </div>
  );
};

const ChapterTwoOptimised = () => {
  return (
    // VerySlowComponent is created HERE, where state doesn't change
    <MovingBlock>
      <VerySlowComponent />
    </MovingBlock>
  );
};
                `}
            />
        </div>
        <div className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
          <p className="text-sm text-emerald-600 dark:text-emerald-400">
            <strong>✅ Solution:</strong> The VerySlowComponent is passed as{" "}
            <code className="rounded bg-emerald-500/20 px-1 py-0.5 text-xs">children</code>{" "}
            to MovingBlock. Since it&apos;s created in the parent scope, it doesn&apos;t
            re-render when MovingBlock&apos;s state changes!
          </p>
        </div>
      </div>

      {/* VerySlowComponent is passed as children - created in THIS scope */}
      <MovingBlock>
        <VerySlowComponent />
      </MovingBlock>
    </div>
  );
};

export default ChapterTwoOptimised;
