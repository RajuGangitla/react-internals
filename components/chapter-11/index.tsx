"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";

// ===========================================
// SIMPLE DEBOUNCE IMPLEMENTATION
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

// ===========================================
// DEMO 1: Naive debounce (broken - just delays)
// ===========================================

const NaiveDebounceDemo = () => {
  const [value, setValue] = useState("");
  const [requests, setRequests] = useState<string[]>([]);

  // ❌ This is called on EVERY render!
  // Creates new debounce, new timer each time
  const sendRequest = (val: string) => {
    setRequests((prev) => [...prev, val]);
  };

  // ❌ Debounce is called on every render = just a delay, not debounce!
  const debouncedSendRequest = debounce(sendRequest, 500);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue(val);
    debouncedSendRequest(val);
  };

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
      <h3 className="mb-3 font-semibold text-red-700 dark:text-red-400">
        ❌ Naive Debounce (Broken)
      </h3>
      <p className="mb-3 text-xs text-red-600 dark:text-red-500">
        Debounce is called on every render → creates new timer each time →
        acts like delay, not debounce!
      </p>

      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="Type fast... each letter will fire!"
        className="mb-3 w-full rounded border border-red-300 px-3 py-2 text-sm dark:border-red-700 dark:bg-zinc-800"
      />

      <div className="rounded bg-zinc-800 p-3">
        <p className="mb-2 text-xs text-zinc-400">
          Requests sent (should be 1, but...):
        </p>
        <div className="flex flex-wrap gap-1">
          {requests.map((req, i) => (
            <span
              key={i}
              className="rounded bg-red-500/20 px-2 py-0.5 text-xs text-red-400"
            >
              {req || '""'}
            </span>
          ))}
          {requests.length === 0 && (
            <span className="text-xs text-zinc-500">None yet...</span>
          )}
        </div>
      </div>

      <button
        onClick={() => setRequests([])}
        className="mt-2 text-xs text-red-500 underline"
        type="button"
      >
        Clear
      </button>

      <pre className="mt-3 overflow-x-auto text-xs text-red-600 dark:text-red-400">
{`// ❌ Called on every render!
const debouncedSendRequest = debounce(sendRequest, 500);

// Every state update → re-render → new debounce()
// → new timer → old timer fires → NOT debounced!`}
      </pre>
    </div>
  );
};

// ===========================================
// DEMO 2: useMemo debounce (works, but no state access)
// ===========================================

const MemoizedDebounceDemo = () => {
  const [value, setValue] = useState("");
  const [requests, setRequests] = useState<string[]>([]);

  // ✅ Memoized callback - stable reference
  const sendRequest = useCallback((val: string) => {
    setRequests((prev) => [...prev, val]);
  }, []);

  // ✅ Debounce is memoized - only created once!
  const debouncedSendRequest = useMemo(() => {
    return debounce(sendRequest, 500);
  }, [sendRequest]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue(val);
    debouncedSendRequest(val);
  };

  return (
    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-900/20">
      <h3 className="mb-3 font-semibold text-emerald-700 dark:text-emerald-400">
        ✅ useMemo Debounce (Works!)
      </h3>
      <p className="mb-3 text-xs text-emerald-600 dark:text-emerald-500">
        Debounce is memoized with useMemo → created once → proper debouncing!
        But value must be passed as argument.
      </p>

      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="Type fast... only last value fires!"
        className="mb-3 w-full rounded border border-emerald-300 px-3 py-2 text-sm dark:border-emerald-700 dark:bg-zinc-800"
      />

      <div className="rounded bg-zinc-800 p-3">
        <p className="mb-2 text-xs text-zinc-400">
          Requests sent (should be 1):
        </p>
        <div className="flex flex-wrap gap-1">
          {requests.map((req, i) => (
            <span
              key={i}
              className="rounded bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-400"
            >
              {req || '""'}
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

      <pre className="mt-3 overflow-x-auto text-xs text-emerald-600 dark:text-emerald-400">
{`// ✅ Memoized - only created once
const debouncedSendRequest = useMemo(() => {
  return debounce(sendRequest, 500);
}, [sendRequest]);

// BUT: must pass value as argument, can't read from state`}
      </pre>
    </div>
  );
};

// ===========================================
// DEMO 3: useMemo with state dependency (broken again!)
// ===========================================

const MemoWithStateDepsDemo = () => {
  const [value, setValue] = useState("");
  const [requests, setRequests] = useState<string[]>([]);

  // ❌ Callback depends on state
  const sendRequest = useCallback(() => {
    // Reading value from state, not argument!
    setRequests((prev) => [...prev, value]);
  }, [value]); // Must include value!

  // ❌ Debounce depends on sendRequest which changes with value
  const debouncedSendRequest = useMemo(() => {
    return debounce(sendRequest, 500);
  }, [sendRequest]); // Changes on every keystroke!

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue(val);
    debouncedSendRequest();
  };

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
      <h3 className="mb-3 font-semibold text-amber-700 dark:text-amber-400">
        ❌ useMemo with State Dependency (Broken Again!)
      </h3>
      <p className="mb-3 text-xs text-amber-600 dark:text-amber-500">
        If callback reads from state → must be in deps → debounce recreated →
        back to just delay!
      </p>

      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="Type fast... each letter fires again!"
        className="mb-3 w-full rounded border border-amber-300 px-3 py-2 text-sm dark:border-amber-700 dark:bg-zinc-800"
      />

      <div className="rounded bg-zinc-800 p-3">
        <p className="mb-2 text-xs text-zinc-400">
          Requests sent (should be 1, but...):
        </p>
        <div className="flex flex-wrap gap-1">
          {requests.map((req, i) => (
            <span
              key={i}
              className="rounded bg-amber-500/20 px-2 py-0.5 text-xs text-amber-400"
            >
              {req || '""'}
            </span>
          ))}
          {requests.length === 0 && (
            <span className="text-xs text-zinc-500">None yet...</span>
          )}
        </div>
      </div>

      <button
        onClick={() => setRequests([])}
        className="mt-2 text-xs text-amber-500 underline"
        type="button"
      >
        Clear
      </button>

      <pre className="mt-3 overflow-x-auto text-xs text-amber-600 dark:text-amber-400">
{`// ❌ Callback uses state directly
const sendRequest = useCallback(() => {
  console.log(value); // From state!
}, [value]); // Changes every keystroke!

// ❌ Debounce recreated every time
const debouncedSendRequest = useMemo(() => {
  return debounce(sendRequest, 500);
}, [sendRequest]); // Also changes!`}
      </pre>
    </div>
  );
};

// ===========================================
// DEMO 4: Naive Ref approach (stale closure!)
// ===========================================

const NaiveRefDemo = () => {
  const [value, setValue] = useState("");
  const [requests, setRequests] = useState<string[]>([]);

  // ❌ Ref initialized once - closure frozen!
  const debouncedRef = useRef(
    debounce(() => {
      // This closure is frozen at mount time!
      setRequests((prev) => [...prev, value]);
    }, 500)
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue(val);
    debouncedRef.current();
  };

  return (
    <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-900/20">
      <h3 className="mb-3 font-semibold text-purple-700 dark:text-purple-400">
        ❌ Naive useRef (Stale Closure!)
      </h3>
      <p className="mb-3 text-xs text-purple-600 dark:text-purple-500">
        Ref is initialized once → closure frozen → always logs initial value
        (&quot;&quot;)!
      </p>

      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="Type anything... value is always empty!"
        className="mb-3 w-full rounded border border-purple-300 px-3 py-2 text-sm dark:border-purple-700 dark:bg-zinc-800"
      />

      <div className="rounded bg-zinc-800 p-3">
        <p className="mb-2 text-xs text-zinc-400">
          Requests sent (always empty string!):
        </p>
        <div className="flex flex-wrap gap-1">
          {requests.map((req, i) => (
            <span
              key={i}
              className="rounded bg-purple-500/20 px-2 py-0.5 text-xs text-purple-400"
            >
              &quot;{req}&quot;
            </span>
          ))}
          {requests.length === 0 && (
            <span className="text-xs text-zinc-500">None yet...</span>
          )}
        </div>
      </div>

      <button
        onClick={() => setRequests([])}
        className="mt-2 text-xs text-purple-500 underline"
        type="button"
      >
        Clear
      </button>

      <pre className="mt-3 overflow-x-auto text-xs text-purple-600 dark:text-purple-400">
{`// ❌ Ref initialized once - closure frozen!
const debouncedRef = useRef(
  debounce(() => {
    console.log(value); // Always ""!
  }, 500)
);

// value is captured at mount time, never updated`}
      </pre>
    </div>
  );
};

// ===========================================
// MAIN COMPONENT
// ===========================================

const ChapterEleven = () => {
  return (
    <div className="layout mx-auto max-w-2xl p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Chapter 11: Debouncing & Throttling</h1>
        <p className="mt-2 text-muted-foreground">
          This chapter shows the challenges of implementing debounce/throttle
          properly in React.
        </p>
        <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-4">
          <p className="text-sm text-red-600 dark:text-red-400">
            <strong>❌ Problem:</strong> Re-renders create new debounce
            timers. State in closures gets stale. Many approaches seem to work
            but don&apos;t!
          </p>
        </div>
      </div>

      {/* What is debounce */}
      <div className="mb-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
        <h3 className="mb-3 font-semibold">What is Debounce vs Throttle?</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-blue-600 dark:text-blue-400">
              Debounce
            </h4>
            <p className="text-xs text-zinc-500">
              Wait until user <em>stops</em> doing something. Reset timer on
              each call. Good for search inputs.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-purple-600 dark:text-purple-400">
              Throttle
            </h4>
            <p className="text-xs text-zinc-500">
              Execute at most once per interval. Good for scroll events,
              auto-save.
            </p>
          </div>
        </div>
      </div>

      {/* Demos */}
      <div className="space-y-6">
        <NaiveDebounceDemo />
        <MemoizedDebounceDemo />
        <MemoWithStateDepsDemo />
        <NaiveRefDemo />
      </div>

      {/* Summary */}
      <div className="mt-8 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
        <h3 className="mb-3 font-semibold">The Challenges:</h3>
        <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
          <li className="flex items-start gap-2">
            <span className="text-red-500">❌</span>
            <span>
              <strong>Naive:</strong> debounce() called every render → new timer
              → just delays
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500">✓</span>
            <span>
              <strong>useMemo:</strong> Works if value passed as argument, not
              from state
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500">❌</span>
            <span>
              <strong>useMemo + state deps:</strong> Deps change → debounce
              recreated → back to delay
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-500">❌</span>
            <span>
              <strong>Naive Ref:</strong> Closure frozen at mount → stale state
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ChapterEleven;

