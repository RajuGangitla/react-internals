"use client";

import React, { useState } from "react";

// VerySlowComponent - simulates a slow rendering component
// We wrap it in React.memo, hoping it won't re-render
const VerySlowComponent = React.memo(({ data, onChange }: { data: { value: number }; onChange: () => void }) => {
  // Simulate slow rendering by doing some heavy computation
  const startTime = performance.now();
  while (performance.now() - startTime < 100) {
    // Artificial delay - blocking for 100ms
  }

  return (
    <div className="mt-6 rounded-lg border border-dashed border-amber-500/50 bg-amber-500/10 p-6">
      <h3 className="text-lg font-semibold text-amber-600 dark:text-amber-400">
        🐢 VerySlowComponent (Memoized?)
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">
        I am wrapped in <code>React.memo</code>! I should not re-render when the parent state changes, right?
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        Data value: {data.value}
      </p>
      <p className="mt-2 text-xs text-amber-600/70 dark:text-amber-400/70">
        Rendered at: {new Date().toLocaleTimeString()}
      </p>
      <button 
        onClick={onChange}
        className="mt-4 rounded bg-amber-500 px-4 py-2 text-white hover:bg-amber-600"
      >
        Click me (Log)
      </button>
    </div>
  );
});

VerySlowComponent.displayName = "VerySlowComponent";

// New component to test children memoization
const SlowComponentWithChildren = React.memo(({ children }: { children: React.ReactNode }) => {
  const startTime = performance.now();
  while (performance.now() - startTime < 100) {
    // Artificial delay
  }

  return (
    <div className="mt-6 rounded-lg border border-dashed border-purple-500/50 bg-purple-500/10 p-6">
      <h3 className="text-lg font-semibold text-purple-600 dark:text-purple-400">
        🐢 SlowComponentWithChildren
      </h3>
       <p className="mt-2 text-sm text-muted-foreground">
        I am also wrapped in <code>React.memo</code>. Do I re-render?
      </p>
      <div className="mt-4 rounded bg-white p-4 dark:bg-zinc-900">
        {children}
      </div>
      <p className="mt-2 text-xs text-purple-600/70 dark:text-purple-400/70">
        Rendered at: {new Date().toLocaleTimeString()}
      </p>
    </div>
  );
});
SlowComponentWithChildren.displayName = "SlowComponentWithChildren";


const ChapterFive = () => {
  const [count, setCount] = useState(0);

  return (
    <div className="layout mx-auto max-w-2xl p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Chapter 5: Memoization (Problem)</h1>
        <p className="mt-2 text-muted-foreground">
          This example demonstrates how broken memoization causes unnecessary re-renders despite using <code>React.memo</code>.
        </p>
        <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-4">
          <p className="text-sm text-red-600 dark:text-red-400">
            <strong>❌ Problem:</strong> The components are wrapped in <code>React.memo</code>, but we pass <strong>inline props/children</strong>. These create new references on every render, causing the comparison to fail.
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-zinc-200 p-6 dark:border-zinc-800">
        <div className="mb-6 flex items-center justify-between">
            <div>
                <h2 className="text-lg font-semibold">Parent Component</h2>
                <p className="text-sm text-muted-foreground">Clicking the button updates parent state.</p>
            </div>
            <button
            onClick={() => setCount((c) => c + 1)}
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            >
            Count: {count}
            </button>
        </div>

        <div className="border-t border-zinc-200 pt-6 dark:border-zinc-800">
            <h3 className="font-medium">Example 1: Inline Props</h3>
            {/* 
              This is the problem! 
              data={{ value: 1 }} creates a NEW object every render.
              onChange={() => {}} creates a NEW function every render.
            */}
            <VerySlowComponent 
                data={{ value: 1 }} 
                onChange={() => console.log("Clicked")} 
            />

            <div className="mt-8 border-t border-zinc-200 pt-6 dark:border-zinc-800">
               <h3 className="font-medium">Example 2: Children as Props</h3>
               {/* 
                  This is also a problem!
                  The JSX <div>...</div> is syntactic sugar for React.createElement(),
                  which returns a NEW object every time.
                  So 'children' prop changes every render.
                */}
               <SlowComponentWithChildren>
                  <div className="font-medium text-zinc-900 dark:text-zinc-100">
                    I am passed as children!
                  </div>
               </SlowComponentWithChildren>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ChapterFive;
