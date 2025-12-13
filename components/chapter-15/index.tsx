"use client";

import { useState, useEffect } from "react";

// ===========================================
// COMPONENT THAT THROWS ERRORS
// ===========================================

const BuggyCounter = ({ shouldThrow }: { shouldThrow: boolean }) => {
  const [count, setCount] = useState(0);

  if (shouldThrow && count >= 3) {
    throw new Error("Counter crashed at 3!");
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
      <p className="mb-2">
        Count: <strong>{count}</strong>
      </p>
      <button
        onClick={() => setCount((c) => c + 1)}
        className="rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
        type="button"
      >
        Increment
      </button>
      {shouldThrow && (
        <p className="mt-2 text-xs text-red-500">Will crash at count = 3!</p>
      )}
    </div>
  );
};

// ===========================================
// DEMO 1: try/catch can't catch children errors
// ===========================================

const TryCatchChildrenDemo = () => {
  const [hasError, setHasError] = useState(false);

  // ❌ This won't catch errors from BuggyCounter!
  let child;
  try {
    child = <BuggyCounter shouldThrow={true} />;
  } catch (e) {
    // This will NEVER be called
    setHasError(true);
  }

  if (hasError) {
    return <div className="text-red-500">Caught an error!</div>;
  }

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
      <h3 className="mb-3 font-semibold text-red-700 dark:text-red-400">
        ❌ try/catch can&apos;t catch children errors
      </h3>
      <p className="mb-3 text-sm text-red-600 dark:text-red-500">
        Click increment until count = 3. The error will crash the entire app!
      </p>
      {child}
      <pre className="mt-3 overflow-x-auto text-xs text-red-600 dark:text-red-400">
{`// This WON'T work!
try {
  return <BuggyCounter />;
} catch (e) {
  // Never called - <BuggyCounter /> 
  // is just a description, not a render!
}`}
      </pre>
    </div>
  );
};

// ===========================================
// DEMO 2: try/catch can't wrap useEffect
// ===========================================

const TryCatchEffectDemo = () => {
  const [error, setError] = useState<string | null>(null);

  // ❌ Can't wrap useEffect with try/catch
  try {
    useEffect(() => {
      // This error won't be caught by the outer try/catch!
      // throw new Error("Error in useEffect!");
    }, []);
  } catch (e) {
    // This will NEVER be called
  }

  // ✅ Must put try/catch INSIDE useEffect
  useEffect(() => {
    try {
      // Simulated async operation
      const shouldFail = false;
      if (shouldFail) {
        throw new Error("Async operation failed!");
      }
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
      <h3 className="mb-3 font-semibold text-amber-700 dark:text-amber-400">
        ❌ try/catch can&apos;t wrap useEffect
      </h3>
      {error && <p className="text-red-500">Error: {error}</p>}
      <pre className="overflow-x-auto text-xs text-amber-600 dark:text-amber-500">
{`// ❌ WRONG - won't catch anything
try {
  useEffect(() => {
    throw new Error("Boom!");
  }, []);
} catch (e) { /* never called */ }

// ✅ CORRECT - try/catch inside
useEffect(() => {
  try {
    doSomething();
  } catch (e) {
    setError(e);
  }
}, []);`}
      </pre>
    </div>
  );
};

// ===========================================
// DEMO 3: Async errors escape try/catch
// ===========================================

const AsyncErrorDemo = () => {
  const [log, setLog] = useState<string[]>([]);

  const handleClickBad = () => {
    try {
      // ❌ This error will NOT be caught
      setTimeout(() => {
        // throw new Error("Async error!"); // Uncomment to crash
        setLog((prev) => [...prev, "setTimeout executed (error would crash app)"]);
      }, 100);
      setLog((prev) => [...prev, "try block completed"]);
    } catch (e) {
      // This will NEVER be called for setTimeout errors
      setLog((prev) => [...prev, "Caught: " + (e as Error).message]);
    }
  };

  const handleClickGood = () => {
    // ✅ Handle async errors inside the async callback
    setTimeout(() => {
      try {
        const shouldFail = true;
        if (shouldFail) {
          throw new Error("Async error!");
        }
      } catch (e) {
        setLog((prev) => [...prev, "Caught inside setTimeout: " + (e as Error).message]);
      }
    }, 100);
  };

  return (
    <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-900/20">
      <h3 className="mb-3 font-semibold text-purple-700 dark:text-purple-400">
        ❌ Async errors escape outer try/catch
      </h3>
      <div className="mb-3 flex gap-2">
        <button
          onClick={handleClickBad}
          className="rounded bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600"
          type="button"
        >
          Bad (outer try/catch)
        </button>
        <button
          onClick={handleClickGood}
          className="rounded bg-emerald-500 px-3 py-1 text-sm text-white hover:bg-emerald-600"
          type="button"
        >
          Good (inner try/catch)
        </button>
        <button
          onClick={() => setLog([])}
          className="rounded bg-zinc-300 px-3 py-1 text-sm text-zinc-700"
          type="button"
        >
          Clear
        </button>
      </div>
      {log.length > 0 && (
        <div className="rounded bg-zinc-800 p-2 font-mono text-xs text-zinc-200">
          {log.map((entry, i) => (
            <div key={i}>{entry}</div>
          ))}
        </div>
      )}
    </div>
  );
};

// ===========================================
// DEMO 4: Event handlers need their own try/catch
// ===========================================

const EventHandlerDemo = () => {
  const [hasError, setHasError] = useState(false);
  const [caughtError, setCaughtError] = useState<string | null>(null);

  // ❌ Can't catch with outer try/catch
  const handleClickBad = () => {
    throw new Error("Button click error!");
  };

  // ✅ Must catch inside the handler
  const handleClickGood = () => {
    try {
      throw new Error("Button click error!");
    } catch (e) {
      setCaughtError((e as Error).message);
    }
  };

  if (hasError) {
    return <div>Error state</div>;
  }

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
      <h3 className="mb-3 font-semibold text-blue-700 dark:text-blue-400">
        ❌ Event handlers need internal try/catch
      </h3>
      <div className="mb-3 flex gap-2">
        <button
          onClick={handleClickBad}
          className="rounded bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600"
          type="button"
        >
          ❌ Will crash app
        </button>
        <button
          onClick={handleClickGood}
          className="rounded bg-emerald-500 px-3 py-1 text-sm text-white hover:bg-emerald-600"
          type="button"
        >
          ✅ Properly handled
        </button>
      </div>
      {caughtError && (
        <p className="text-sm text-emerald-600 dark:text-emerald-400">
          Caught: {caughtError}
        </p>
      )}
    </div>
  );
};

// ===========================================
// MAIN COMPONENT
// ===========================================

const ChapterFifteen = () => {
  const [showCrashDemo, setShowCrashDemo] = useState(false);

  return (
    <div className="layout mx-auto max-w-2xl p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Chapter 15: Error Handling</h1>
        <p className="mt-2 text-muted-foreground">
          This chapter shows the limitations of try/catch for error handling in
          React.
        </p>
        <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-4">
          <p className="text-sm text-red-600 dark:text-red-400">
            <strong>❌ Problem:</strong> Since React 16, uncaught errors unmount
            the entire app! try/catch has many limitations in React.
          </p>
        </div>
      </div>

      {/* Why error handling matters */}
      <div className="mb-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
        <h3 className="mb-3 font-semibold">Why Error Handling Matters</h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Before React 16, errors would leave broken components on screen. Now,
          <strong> any uncaught error unmounts the entire app</strong> - showing
          a blank white screen to users!
        </p>
      </div>

      {/* Demos */}
      <div className="space-y-6">
        {/* Demo toggle */}
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <h3 className="mb-2 font-semibold text-red-700 dark:text-red-400">
            ⚠️ Crash Demo (will break the page!)
          </h3>
          <p className="mb-3 text-sm text-red-600 dark:text-red-500">
            This demo will actually crash. You&apos;ll need to refresh the page.
          </p>
          <button
            onClick={() => setShowCrashDemo(true)}
            className="rounded bg-red-500 px-4 py-2 text-sm text-white hover:bg-red-600"
            type="button"
          >
            {showCrashDemo ? "Demo Active" : "Show Crash Demo"}
          </button>
          {showCrashDemo && (
            <div className="mt-4">
              <TryCatchChildrenDemo />
            </div>
          )}
        </div>

        <TryCatchEffectDemo />
        <AsyncErrorDemo />
        <EventHandlerDemo />
      </div>

      {/* Summary of limitations */}
      <div className="mt-8 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
        <h3 className="mb-3 font-semibold">try/catch Limitations in React:</h3>
        <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
          <li className="flex items-start gap-2">
            <span className="text-red-500">❌</span>
            <span>
              <strong>Children components:</strong> Can&apos;t catch errors from
              nested components - JSX is just a description, not a render
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-500">❌</span>
            <span>
              <strong>useEffect:</strong> Can&apos;t wrap useEffect - it runs async
              after try/catch completes
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-500">❌</span>
            <span>
              <strong>Event handlers:</strong> Errors in onClick, onChange etc.
              escape outer try/catch
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-500">❌</span>
            <span>
              <strong>Async code:</strong> setTimeout, fetch, Promises all run
              after try/catch is done
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-500">❌</span>
            <span>
              <strong>State during render:</strong> Can&apos;t call setState in
              catch during render - causes infinite loops
            </span>
          </li>
        </ul>
      </div>

      {/* The pattern to avoid */}
      <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
        <h3 className="mb-2 font-semibold">❌ This Won&apos;t Work:</h3>
        <pre className="overflow-x-auto text-xs text-zinc-600 dark:text-zinc-400">
{`const Component = () => {
  const [hasError, setHasError] = useState(false);
  
  try {
    // ❌ Can't catch children errors
    return <ChildThatMightCrash />;
  } catch (e) {
    // ❌ Never called for child errors!
    return <ErrorScreen />;
  }
};`}
        </pre>
      </div>
    </div>
  );
};

export default ChapterFifteen;

