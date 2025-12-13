"use client";

import { useState, useCallback, useRef, useEffect, memo } from "react";

// ===========================================
// THE PROBLEM: Stale Closures
// ===========================================

// Simulated heavy component
const HeavyComponent = memo(
  ({
    title,
    onClick,
  }: {
    title: string;
    onClick: () => void;
  }) => {
    const startTime = performance.now();
    while (performance.now() - startTime < 50) {
      // Artificial delay
    }

    return (
      <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-4">
        <h4 className="font-medium text-amber-600 dark:text-amber-400">
          🐢 {title}
        </h4>
        <p className="mt-1 text-xs text-amber-500/70">
          Heavy component (50ms render) - {new Date().toLocaleTimeString()}
        </p>
        <button
          onClick={onClick}
          className="mt-3 rounded bg-amber-500 px-3 py-1 text-sm text-white hover:bg-amber-600"
          type="button"
        >
          Submit Form Data
        </button>
      </div>
    );
  },
  // Custom comparison - only comparing title, ignoring onClick!
  (before, after) => {
    return before.title === after.title;
  }
);
HeavyComponent.displayName = "HeavyComponent";

// ===========================================
// DEMO 1: Stale closure in useCallback
// ===========================================

const StaleCallbackDemo = () => {
  const [count, setCount] = useState(0);
  const [log, setLog] = useState<string[]>([]);

  // ❌ Stale closure! Missing 'count' in dependencies
  const handleClickStale = useCallback(() => {
    setLog((prev) => [...prev, `Stale: count = ${count}`]);
  }, []); // Missing count!

  // ✅ Fresh closure - includes count in dependencies
  const handleClickFresh = useCallback(() => {
    setLog((prev) => [...prev, `Fresh: count = ${count}`]);
  }, [count]);

  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
      <h3 className="mb-3 font-semibold">Stale useCallback Demo</h3>

      <div className="mb-4 flex items-center gap-4">
        <span className="text-lg font-bold">Count: {count}</span>
        <button
          onClick={() => setCount((c) => c + 1)}
          className="rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
          type="button"
        >
          Increment
        </button>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleClickStale}
          className="rounded bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600"
          type="button"
        >
          ❌ Log with Stale Closure
        </button>
        <button
          onClick={handleClickFresh}
          className="rounded bg-emerald-500 px-3 py-1 text-sm text-white hover:bg-emerald-600"
          type="button"
        >
          ✅ Log with Fresh Closure
        </button>
        <button
          onClick={() => setLog([])}
          className="rounded bg-zinc-300 px-3 py-1 text-sm text-zinc-700 hover:bg-zinc-400 dark:bg-zinc-600 dark:text-zinc-200"
          type="button"
        >
          Clear
        </button>
      </div>

      {log.length > 0 && (
        <div className="mt-4 rounded bg-zinc-800 p-3 font-mono text-xs text-zinc-200">
          {log.map((entry, i) => (
            <div key={i} className={entry.includes("Stale") ? "text-red-400" : "text-emerald-400"}>
              {entry}
            </div>
          ))}
        </div>
      )}

      <pre className="mt-3 overflow-x-auto text-xs text-zinc-500">
{`// ❌ Stale - always logs initial count (0)
const handleClick = useCallback(() => {
  console.log(count); // Always 0!
}, []); // Missing count in dependencies!

// ✅ Fresh - logs current count
const handleClick = useCallback(() => {
  console.log(count);
}, [count]); // Refreshes when count changes`}
      </pre>
    </div>
  );
};

// ===========================================
// DEMO 2: Stale closure in useRef
// ===========================================

const StaleRefDemo = () => {
  const [value, setValue] = useState("");
  const [log, setLog] = useState<string[]>([]);

  // ❌ Stale closure! Ref initialized once, never updated
  const staleRef = useRef(() => {
    setLog((prev) => [...prev, `Stale Ref: value = "${value}"`]);
  });

  // ✅ Fresh - update ref in useEffect
  const freshRef = useRef<() => void>(() => {});
  useEffect(() => {
    freshRef.current = () => {
      setLog((prev) => [...prev, `Fresh Ref: value = "${value}"`]);
    };
  }, [value]);

  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
      <h3 className="mb-3 font-semibold">Stale useRef Demo</h3>

      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Type something..."
        className="mb-4 w-full rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800"
      />

      <div className="flex gap-2">
        <button
          onClick={() => staleRef.current()}
          className="rounded bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600"
          type="button"
        >
          ❌ Call Stale Ref
        </button>
        <button
          onClick={() => freshRef.current()}
          className="rounded bg-emerald-500 px-3 py-1 text-sm text-white hover:bg-emerald-600"
          type="button"
        >
          ✅ Call Fresh Ref
        </button>
        <button
          onClick={() => setLog([])}
          className="rounded bg-zinc-300 px-3 py-1 text-sm text-zinc-700 hover:bg-zinc-400 dark:bg-zinc-600 dark:text-zinc-200"
          type="button"
        >
          Clear
        </button>
      </div>

      {log.length > 0 && (
        <div className="mt-4 rounded bg-zinc-800 p-3 font-mono text-xs text-zinc-200">
          {log.map((entry, i) => (
            <div key={i} className={entry.includes("Stale") ? "text-red-400" : "text-emerald-400"}>
              {entry}
            </div>
          ))}
        </div>
      )}

      <pre className="mt-3 overflow-x-auto text-xs text-zinc-500">
{`// ❌ Stale - ref initialized once, closure frozen
const ref = useRef(() => {
  console.log(value); // Always ""!
});

// ✅ Fresh - update ref.current in useEffect
const ref = useRef(() => {});
useEffect(() => {
  ref.current = () => {
    console.log(value); // Current value!
  };
}, [value]);`}
      </pre>
    </div>
  );
};

// ===========================================
// DEMO 3: Stale closure in React.memo comparison
// ===========================================

const StaleMemoDemo = () => {
  const [formValue, setFormValue] = useState("");
  const [submittedValue, setSubmittedValue] = useState<string | null>(null);

  // This onClick forms a closure over formValue
  // But React.memo ignores it in comparison!
  const onClick = () => {
    setSubmittedValue(formValue);
  };

  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
      <h3 className="mb-3 font-semibold">Stale React.memo Demo</h3>

      <input
        type="text"
        value={formValue}
        onChange={(e) => setFormValue(e.target.value)}
        placeholder="Type something, then click Submit..."
        className="mb-4 w-full rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800"
      />

      <p className="mb-2 text-sm text-zinc-600 dark:text-zinc-400">
        Current input: <strong>&quot;{formValue}&quot;</strong>
      </p>

      <HeavyComponent title="Heavy Form Component" onClick={onClick} />

      {submittedValue !== null && (
        <div className="mt-4 rounded border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-sm text-red-600 dark:text-red-400">
            <strong>Submitted:</strong> &quot;{submittedValue}&quot;
            {submittedValue === "" && (
              <span className="ml-2">(Always empty! Stale closure!)</span>
            )}
          </p>
        </div>
      )}

      <pre className="mt-3 overflow-x-auto text-xs text-zinc-500">
{`// React.memo with custom comparison
const Heavy = memo(Component, (before, after) => {
  // Only comparing title, ignoring onClick!
  return before.title === after.title;
});

// onClick is never updated in Heavy component
// because comparison always returns true
// Result: stale closure with initial state value`}
      </pre>
    </div>
  );
};

// ===========================================
// MAIN COMPONENT
// ===========================================

const ChapterTen = () => {
  return (
    <div className="layout mx-auto max-w-2xl p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Chapter 10: Closures in React</h1>
        <p className="mt-2 text-muted-foreground">
          This chapter demonstrates the &quot;stale closure&quot; problem - one of the
          most confusing bugs in React.
        </p>
        <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-4">
          <p className="text-sm text-red-600 dark:text-red-400">
            <strong>❌ Problem:</strong> Closures &quot;freeze&quot; values at creation
            time. If not refreshed properly, you get stale data!
          </p>
        </div>
      </div>

      {/* What is a closure */}
      <div className="mb-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
        <h3 className="mb-3 font-semibold">What is a Closure?</h3>
        <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">
          A closure is formed when a function &quot;captures&quot; variables from its
          surrounding scope. The values are &quot;frozen&quot; at the moment of creation.
        </p>
        <pre className="overflow-x-auto text-xs text-zinc-600 dark:text-zinc-400">
{`const createClosure = (value) => {
  // This inner function "closes over" value
  return () => {
    console.log(value); // Always the same value!
  };
};

const first = createClosure("first");
const second = createClosure("second");

first();  // logs "first"
second(); // logs "second"

// Each function has its own "frozen" copy of value`}
        </pre>
      </div>

      {/* Demo 1: useCallback */}
      <div className="mb-6">
        <StaleCallbackDemo />
      </div>

      {/* Demo 2: useRef */}
      <div className="mb-6">
        <StaleRefDemo />
      </div>

      {/* Demo 3: React.memo */}
      <div className="mb-6">
        <StaleMemoDemo />
      </div>

      {/* Common causes */}
      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
        <h3 className="mb-3 font-semibold">Common Stale Closure Causes:</h3>
        <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
          <li className="flex items-start gap-2">
            <span className="text-red-500">❌</span>
            <span>
              <strong>useCallback:</strong> Missing dependencies in the array
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-500">❌</span>
            <span>
              <strong>useRef:</strong> Storing function at initialization,
              never updating
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-500">❌</span>
            <span>
              <strong>React.memo:</strong> Custom comparison function ignoring
              callback props
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-500">❌</span>
            <span>
              <strong>useEffect:</strong> Missing dependencies, closure never
              refreshed
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-500">❌</span>
            <span>
              <strong>Event listeners:</strong> Adding listener once, never
              removing/re-adding
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ChapterTen;

