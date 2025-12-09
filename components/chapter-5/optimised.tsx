"use client";

import React, { useState, useMemo, useCallback } from "react";

// VerySlowComponent - same as before
const VerySlowComponent = React.memo(({ data, onChange }: { data: { value: number }; onChange: () => void }) => {
  const startTime = performance.now();
  while (performance.now() - startTime < 100) {
    // Artificial delay
  }

  return (
    <div className="mt-6 rounded-lg border border-dashed border-emerald-500/50 bg-emerald-500/10 p-6">
      <h3 className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
        🐢 VerySlowComponent (Memoized Properly)
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">
        I am wrapped in <code>React.memo</code>! Since my props are stable, I won&apos;t re-render when the parent count changes.
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        Data value: {data.value}
      </p>
      <p className="mt-2 text-xs text-emerald-600/70 dark:text-emerald-400/70">
        Rendered at: {new Date().toLocaleTimeString()}
      </p>
      <button 
        onClick={onChange}
        className="mt-4 rounded bg-emerald-500 px-4 py-2 text-white hover:bg-emerald-600"
      >
        Click me (Log)
      </button>
    </div>
  );
});

VerySlowComponent.displayName = "VerySlowComponent";

// SlowComponentWithChildren - same as before
const SlowComponentWithChildren = React.memo(({ children }: { children: React.ReactNode }) => {
  const startTime = performance.now();
  while (performance.now() - startTime < 100) {
    // Artificial delay
  }

  return (
    <div className="mt-6 rounded-lg border border-dashed border-emerald-500/50 bg-emerald-500/10 p-6">
      <h3 className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
        🐢 SlowComponentWithChildren (Memoized Properly)
      </h3>
       <p className="mt-2 text-sm text-muted-foreground">
        My children prop is memoized now!
      </p>
      <div className="mt-4 rounded bg-white p-4 dark:bg-zinc-900">
        {children}
      </div>
      <p className="mt-2 text-xs text-emerald-600/70 dark:text-emerald-400/70">
        Rendered at: {new Date().toLocaleTimeString()}
      </p>
    </div>
  );
});
SlowComponentWithChildren.displayName = "SlowComponentWithChildren";

const ChapterFiveOptimised = () => {
  const [count, setCount] = useState(0);

  // Fix: Memoize the object so the reference stays the same
  const data = useMemo(() => ({ value: 1 }), []);

  // Fix: Memoize the function so the reference stays the same
  const handleChange = useCallback(() => {
    console.log("Clicked");
  }, []);

  // Fix: Memoize the children element!
  const childContent = useMemo(() => (
    <div className="font-medium text-zinc-900 dark:text-zinc-100">
      I am passed as memoized children!
    </div>
  ), []);

  return (
    <div className="layout mx-auto max-w-2xl p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Chapter 5: Memoization (Optimised)</h1>
        <p className="mt-2 text-muted-foreground">
          This example shows how to correctly use <code>useMemo</code> and <code>useCallback</code> to make <code>React.memo</code> work.
        </p>
        <div className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
          <p className="text-sm text-emerald-600 dark:text-emerald-400">
            <strong>✅ Solution:</strong> We use <code>useMemo</code> for objects/children and <code>useCallback</code> for functions. Now the references are stable across re-renders.
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
            <h3 className="font-medium">Example 1: Memoized Props</h3>
            {/* 
              Now passing memoized props!
            */}
            <VerySlowComponent 
                data={data} 
                onChange={handleChange} 
            />

            <div className="mt-8 border-t border-zinc-200 pt-6 dark:border-zinc-800">
               <h3 className="font-medium">Example 2: Memoized Children</h3>
               {/* 
                  Passing memoized children element
                */}
               <SlowComponentWithChildren>
                  {childContent}
               </SlowComponentWithChildren>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ChapterFiveOptimised;
