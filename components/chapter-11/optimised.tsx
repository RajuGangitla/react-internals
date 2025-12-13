"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";

// ===========================================
// DEBOUNCE & THROTTLE IMPLEMENTATIONS
// ===========================================

const debounce = <T extends (...args: unknown[]) => unknown>(
  callback: T,
  wait: number
): ((...args: Parameters<T>) => void) & { cancel: () => void } => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const debouncedFn = (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      callback(...args);
    }, wait);
  };

  debouncedFn.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  };

  return debouncedFn;
};

const throttle = <T extends (...args: unknown[]) => unknown>(
  callback: T,
  wait: number
): ((...args: Parameters<T>) => void) & { cancel: () => void } => {
  let lastTime = 0;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const throttledFn = (...args: Parameters<T>) => {
    const now = Date.now();

    if (now - lastTime >= wait) {
      lastTime = now;
      callback(...args);
    } else if (!timeoutId) {
      timeoutId = setTimeout(() => {
        lastTime = Date.now();
        timeoutId = null;
        callback(...args);
      }, wait - (now - lastTime));
    }
  };

  throttledFn.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  };

  return throttledFn;
};

// ===========================================
// CUSTOM HOOKS: useDebounce & useThrottle
// The proper solution using the Ref escape hatch!
// ===========================================

/**
 * Debounce a callback that has access to latest state/props
 * without recreating the debounced function.
 */
function useDebounce<T extends (...args: never[]) => unknown>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  // Step 1: Store the latest callback in a ref
  const callbackRef = useRef<T>(callback);

  // Step 2: Update the ref on every render (fresh closure!)
  useEffect(() => {
    callbackRef.current = callback;
  });

  // Step 3: Create stable debounced function that calls the ref
  const debouncedCallback = useMemo(() => {
    const func = (...args: Parameters<T>) => {
      callbackRef.current?.(...args);
    };
    return debounce(func, delay);
  }, [delay]); // Only recreate if delay changes

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      debouncedCallback.cancel();
    };
  }, [debouncedCallback]);

  return debouncedCallback;
}

/**
 * Throttle a callback that has access to latest state/props
 */
function useThrottle<T extends (...args: never[]) => unknown>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const callbackRef = useRef<T>(callback);

  useEffect(() => {
    callbackRef.current = callback;
  });

  const throttledCallback = useMemo(() => {
    const func = (...args: Parameters<T>) => {
      callbackRef.current?.(...args);
    };
    return throttle(func, delay);
  }, [delay]);

  useEffect(() => {
    return () => {
      throttledCallback.cancel();
    };
  }, [throttledCallback]);

  return throttledCallback;
}

// ===========================================
// DEMO 1: useDebounce hook
// ===========================================

const DebounceHookDemo = () => {
  const [value, setValue] = useState("");
  const [otherState, setOtherState] = useState("Some data");
  const [requests, setRequests] = useState<string[]>([]);

  // ✅ Has access to ALL state, but debounced function is stable!
  const debouncedRequest = useDebounce(() => {
    // Can access any state here!
    setRequests((prev) => [...prev, `${value} (other: ${otherState})`]);
  }, 500);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue(val);
    debouncedRequest();
  };

  return (
    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-900/20">
      <h3 className="mb-3 font-semibold text-emerald-700 dark:text-emerald-400">
        ✅ useDebounce Hook
      </h3>
      <p className="mb-3 text-xs text-emerald-600 dark:text-emerald-500">
        Proper debounce with access to latest state! Debounced function is
        stable, closure is always fresh.
      </p>

      <div className="mb-3 space-y-2">
        <input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder="Type fast... only last value fires!"
          className="w-full rounded border border-emerald-300 px-3 py-2 text-sm dark:border-emerald-700 dark:bg-zinc-800"
        />
        <input
          type="text"
          value={otherState}
          onChange={(e) => setOtherState(e.target.value)}
          placeholder="Other state (also accessible)"
          className="w-full rounded border border-emerald-300 px-3 py-2 text-sm dark:border-emerald-700 dark:bg-zinc-800"
        />
      </div>

      <div className="rounded bg-zinc-800 p-3">
        <p className="mb-2 text-xs text-zinc-400">
          Requests sent (debounced, with access to all state):
        </p>
        <div className="flex flex-wrap gap-1">
          {requests.map((req, i) => (
            <span
              key={i}
              className="rounded bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-400"
            >
              {req}
            </span>
          ))}
          {requests.length === 0 && (
            <span className="text-xs text-zinc-500">None yet...</span>
          )}
        </div>
      </div>

      <button
        onClick={() => setRequests([])}
        className="mt-2 text-xs text-emerald-500 underline"
        type="button"
      >
        Clear
      </button>
    </div>
  );
};

// ===========================================
// DEMO 2: useThrottle hook
// ===========================================

const ThrottleHookDemo = () => {
  const [text, setText] = useState("");
  const [saves, setSaves] = useState<string[]>([]);

  // ✅ Throttled auto-save - fires at most once per 1 second
  const throttledSave = useThrottle(() => {
    setSaves((prev) => [
      ...prev,
      `"${text}" @ ${new Date().toLocaleTimeString()}`,
    ]);
  }, 1000);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setText(val);
    throttledSave();
  };

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
      <h3 className="mb-3 font-semibold text-blue-700 dark:text-blue-400">
        ✅ useThrottle Hook (Auto-save)
      </h3>
      <p className="mb-3 text-xs text-blue-600 dark:text-blue-500">
        Throttled save - fires at most once per second. Good for auto-save that
        shouldn&apos;t lose data!
      </p>

      <textarea
        value={text}
        onChange={handleChange}
        placeholder="Type continuously... saves every 1 second max"
        rows={3}
        className="mb-3 w-full rounded border border-blue-300 px-3 py-2 text-sm dark:border-blue-700 dark:bg-zinc-800"
      />

      <div className="rounded bg-zinc-800 p-3">
        <p className="mb-2 text-xs text-zinc-400">
          Auto-saves (throttled to 1/second):
        </p>
        <div className="max-h-24 overflow-y-auto space-y-1">
          {saves.map((save, i) => (
            <div
              key={i}
              className="rounded bg-blue-500/20 px-2 py-0.5 text-xs text-blue-400"
            >
              {save}
            </div>
          ))}
          {saves.length === 0 && (
            <span className="text-xs text-zinc-500">None yet...</span>
          )}
        </div>
      </div>

      <button
        onClick={() => setSaves([])}
        className="mt-2 text-xs text-blue-500 underline"
        type="button"
      >
        Clear
      </button>
    </div>
  );
};

// ===========================================
// DEMO 3: Search with debounce
// ===========================================

const SearchDemo = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Simulated search API
  const fakeSearch = (q: string): string[] => {
    const items = [
      "React",
      "Redux",
      "React Router",
      "React Query",
      "Remix",
      "Recoil",
      "Relay",
    ];
    return items.filter((item) =>
      item.toLowerCase().includes(q.toLowerCase())
    );
  };

  // ✅ Debounced search - waits until user stops typing
  const debouncedSearch = useDebounce(() => {
    if (query.trim()) {
      setIsSearching(true);
      // Simulate API delay
      setTimeout(() => {
        setResults(fakeSearch(query));
        setIsSearching(false);
      }, 200);
    } else {
      setResults([]);
    }
  }, 300);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    debouncedSearch();
  };

  return (
    <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-900/20">
      <h3 className="mb-3 font-semibold text-purple-700 dark:text-purple-400">
        ✅ Debounced Search
      </h3>
      <p className="mb-3 text-xs text-purple-600 dark:text-purple-500">
        Real-world use case: search only fires 300ms after user stops typing.
      </p>

      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder='Search for "React"...'
        className="mb-3 w-full rounded border border-purple-300 px-3 py-2 text-sm dark:border-purple-700 dark:bg-zinc-800"
      />

      <div className="rounded bg-zinc-800 p-3">
        {isSearching ? (
          <p className="text-xs text-zinc-400">Searching...</p>
        ) : results.length > 0 ? (
          <div className="space-y-1">
            {results.map((result, i) => (
              <div
                key={i}
                className="rounded bg-purple-500/20 px-2 py-1 text-xs text-purple-400"
              >
                {result}
              </div>
            ))}
          </div>
        ) : query ? (
          <p className="text-xs text-zinc-500">No results</p>
        ) : (
          <p className="text-xs text-zinc-500">Type to search...</p>
        )}
      </div>
    </div>
  );
};

// ===========================================
// MAIN COMPONENT
// ===========================================

const ChapterElevenOptimised = () => {
  return (
    <div className="layout mx-auto max-w-2xl p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">
          Chapter 11: Debouncing (Optimised)
        </h1>
        <p className="mt-2 text-muted-foreground">
          Proper debounce/throttle implementation using the Ref escape hatch
          pattern.
        </p>
        <div className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
          <p className="text-sm text-emerald-600 dark:text-emerald-400">
            <strong>✅ Solution:</strong> Store latest callback in Ref, update
            every render, call from stable debounced wrapper!
          </p>
        </div>
      </div>

      {/* The pattern */}
      <div className="mb-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
        <h3 className="mb-3 font-semibold">The useDebounce Hook Pattern</h3>
        <pre className="overflow-x-auto rounded bg-zinc-800 p-3 text-xs text-zinc-200">
{`function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
) {
  // Step 1: Store latest callback in ref
  const callbackRef = useRef(callback);

  // Step 2: Update ref on every render (fresh closure!)
  useEffect(() => {
    callbackRef.current = callback;
  });

  // Step 3: Create stable debounced function
  const debouncedCallback = useMemo(() => {
    const func = (...args) => {
      callbackRef.current?.(...args); // Calls latest!
    };
    return debounce(func, delay);
  }, [delay]); // Only delay in deps!

  return debouncedCallback;
}`}
        </pre>
      </div>

      {/* Why it works */}
      <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
        <h3 className="mb-3 font-semibold text-blue-700 dark:text-blue-400">
          Why Does This Work?
        </h3>
        <ol className="space-y-2 text-sm text-blue-600 dark:text-blue-500">
          <li className="flex items-start gap-2">
            <span className="font-bold">1.</span>
            <span>
              <strong>callbackRef.current</strong> is updated on every render
              with fresh closure
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold">2.</span>
            <span>
              <strong>debounce()</strong> is only called once (useMemo with
              [delay])
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold">3.</span>
            <span>
              <strong>When debounce fires</strong>, it calls
              callbackRef.current which has the latest state!
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold">4.</span>
            <span>
              <strong>Refs are mutable</strong> - the frozen closure captures
              the ref object, not its value
            </span>
          </li>
        </ol>
      </div>

      {/* Demos */}
      <div className="space-y-6">
        <DebounceHookDemo />
        <ThrottleHookDemo />
        <SearchDemo />
      </div>

      {/* Comparison */}
      <div className="mt-8 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
        <h3 className="mb-3 font-semibold">Debounce vs Throttle Use Cases</h3>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="rounded bg-emerald-100 p-3 dark:bg-emerald-900/30">
            <h4 className="mb-2 font-medium text-emerald-700 dark:text-emerald-400">
              useDebounce
            </h4>
            <ul className="space-y-1 text-emerald-600 dark:text-emerald-500">
              <li>• Search input</li>
              <li>• Form validation</li>
              <li>• Window resize handler</li>
              <li>• Autocomplete suggestions</li>
            </ul>
          </div>
          <div className="rounded bg-blue-100 p-3 dark:bg-blue-900/30">
            <h4 className="mb-2 font-medium text-blue-700 dark:text-blue-400">
              useThrottle
            </h4>
            <ul className="space-y-1 text-blue-600 dark:text-blue-500">
              <li>• Auto-save drafts</li>
              <li>• Scroll event tracking</li>
              <li>• Mouse move handlers</li>
              <li>• Analytics events</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Key insight */}
      <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
        <h3 className="mb-2 font-semibold text-amber-700 dark:text-amber-400">
          💡 Key Insight
        </h3>
        <p className="text-sm text-amber-600 dark:text-amber-500">
          The debounced/throttled function is created <strong>once</strong>{" "}
          (stable timer), but it always calls the <strong>latest</strong>{" "}
          callback via the ref. This is the same &quot;Ref escape hatch&quot; pattern
          from Chapter 10!
        </p>
      </div>
    </div>
  );
};

export default ChapterElevenOptimised;

