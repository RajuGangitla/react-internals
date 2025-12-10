"use client";

import { useState } from "react";
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
        This component takes ~100ms to render. Notice how it re-renders every
        time you move your mouse because it&apos;s inside the component with state!
      </p>
      <p className="mt-2 text-xs text-amber-600/70 dark:text-amber-400/70">
        Rendered at: {new Date().toLocaleTimeString()}
      </p>
    </div>
  );
};

// Non-optimised: VerySlowComponent is rendered INSIDE the component with state
// This causes it to re-render on every state change
const MovingBlock = () => {
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
        className="pointer-events-none absolute h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500 shadow-lg transition-none"
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

      {/* VerySlowComponent is INSIDE - this is the problem! */}
      <div className="absolute bottom-3 right-3">
        <VerySlowComponent />
      </div>
    </div>
  );
};

// Main component for Chapter 2 - Non-optimised
const ChapterTwo = () => {
  return (
    <div className="layout mx-auto max-w-2xl p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Chapter 2: Elements, Children as Props</h1>
        <p className="mt-2 text-muted-foreground">
          This example demonstrates how placing components inside a stateful
          component causes unnecessary re-renders.
        </p>
        <div className="mt-6">
            <CodeBlock 
                fileName="components/chapter-2/index.tsx"
                code={`
const MovingBlock = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  return (
    <div onMouseMove={handleMouseMove}>
      {/* 
         This component is rendered INSIDE MovingBlock.
         When 'position' state updates, MovingBlock re-renders.
         Therefore, VerySlowComponent also re-renders!
      */}
      <VerySlowComponent />
    </div>
  );
};
                `}
            />
        </div>
        <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-4">
          <p className="text-sm text-red-600 dark:text-red-400">
            <strong>❌ Problem:</strong> The VerySlowComponent is defined INSIDE
            MovingBlock, so it re-renders on every mouse move, making the UI laggy.
          </p>
        </div>
      </div>

      <MovingBlock />
    </div>
  );
};

export default ChapterTwo;
