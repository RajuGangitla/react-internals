"use client";

import { useState, useCallback, useRef, useEffect, memo } from "react";

// ===========================================
// THE SOLUTION: Escaping Closures with Refs
// ===========================================

// Heavy component - properly memoized, no custom comparison needed
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
      <div className="rounded-lg border border-emerald-500/50 bg-emerald-500/10 p-4">
        <h4 className="font-medium text-emerald-600 dark:text-emerald-400">
          🚀 {title}
        </h4>
        <p className="mt-1 text-xs text-emerald-500/70">
          Heavy component (50ms render) - {new Date().toLocaleTimeString()}
        </p>
        <button
          onClick={onClick}
          className="mt-3 rounded bg-emerald-500 px-3 py-1 text-sm text-white hover:bg-emerald-600"
          type="button"
        >
          Submit Form Data
        </button>
      </div>
    );
  }
);
HeavyComponent.displayName = "HeavyComponent";

// ===========================================
// CUSTOM HOOK: useEventCallback
// The "escape hatch" pattern as a reusable hook
// ===========================================

/**
 * Returns a stable callback that always calls the latest version
 * of the provided function. Perfect for event handlers that need
 * access to current state but shouldn't break memoization.
 */
function useEventCallback<T extends (...args: never[]) => unknown>(
  callback: T
): T {
  const ref = useRef<T>(callback);

  // Update ref on every render to capture latest closure
  useEffect(() => {
    ref.current = callback;
  });

  // Return stable callback that calls the ref
  return useCallback((...args: Parameters<T>) => {
    return ref.current(...args);
  }, []) as T;
}

// ===========================================
// DEMO: Form with properly memoized heavy component
// ===========================================

const FormWithRefEscape = () => {
  const [formValue, setFormValue] = useState("");
  const [email, setEmail] = useState("");
  const [submittedData, setSubmittedData] = useState<{
    value: string;
    email: string;
  } | null>(null);

  // Step 1: Create a ref to store the latest closure
  const submitRef = useRef<() => void>(() => {});

  // Step 2: Update the ref on every render with fresh closure
  useEffect(() => {
    submitRef.current = () => {
      // This closure always has access to latest state!
      setSubmittedData({ value: formValue, email });
    };
  }); // No dependencies - runs on every render!

  // Step 3: Create stable callback that calls the ref
  const handleSubmit = useCallback(() => {
    submitRef.current();
  }, []); // Empty dependencies - never changes!

  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
      <h3 className="mb-3 font-semibold">Form with Ref Escape Hatch</h3>

      <div className="mb-4 space-y-3">
        <input
          type="text"
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          placeholder="Name..."
          className="w-full rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email..."
          className="w-full rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800"
        />
      </div>

      <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">
        Current: <strong>&quot;{formValue}&quot;</strong> / <strong>&quot;{email}&quot;</strong>
      </p>

      {/* Heavy component receives stable onClick - won't re-render on typing! */}
      <HeavyComponent title="Heavy Form Component" onClick={handleSubmit} />

      {submittedData && (
        <div className="mt-4 rounded border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-800 dark:bg-emerald-900/20">
          <p className="text-sm text-emerald-600 dark:text-emerald-400">
            <strong>✅ Submitted:</strong> &quot;{submittedData.value}&quot; / &quot;
            {submittedData.email}&quot;
          </p>
        </div>
      )}
    </div>
  );
};

// ===========================================
// DEMO: Using the custom useEventCallback hook
// ===========================================

const FormWithHook = () => {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState<string | null>(null);

  // Using the custom hook - much cleaner!
  const handleSubmit = useEventCallback(() => {
    setSubmitted(`Name: ${name}, Message: ${message}`);
  });

  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
      <h3 className="mb-3 font-semibold">Using useEventCallback Hook</h3>

      <div className="mb-4 space-y-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name..."
          className="w-full rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800"
        />
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Message..."
          rows={2}
          className="w-full rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800"
        />
      </div>

      <HeavyComponent title="With useEventCallback" onClick={handleSubmit} />

      {submitted && (
        <div className="mt-4 rounded border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-800 dark:bg-emerald-900/20">
          <p className="text-sm text-emerald-600 dark:text-emerald-400">
            ✅ {submitted}
          </p>
        </div>
      )}
    </div>
  );
};

// ===========================================
// MAIN COMPONENT
// ===========================================

const ChapterTenOptimised = () => {
  return (
    <div className="layout mx-auto max-w-2xl p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">
          Chapter 10: Closures (Optimised)
        </h1>
        <p className="mt-2 text-muted-foreground">
          This example shows how to escape the stale closure trap using Refs.
        </p>
        <div className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
          <p className="text-sm text-emerald-600 dark:text-emerald-400">
            <strong>✅ Solution:</strong> Store the latest closure in a Ref,
            call it from a stable callback. Best of both worlds!
          </p>
        </div>
      </div>

      {/* The trick explained */}
      <div className="mb-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
        <h3 className="mb-3 font-semibold">The Ref Escape Hatch</h3>
        <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
          <p>
            <strong>Problem:</strong> We need a callback that is both stable
            (for memoization) AND has access to the latest state.
          </p>
          <p>
            <strong>Solution:</strong> Refs are mutable objects that persist
            between renders. We can store the &quot;fresh&quot; closure in a ref and call
            it from a stable wrapper function.
          </p>
        </div>

        <pre className="mt-4 overflow-x-auto rounded bg-zinc-800 p-3 text-xs text-zinc-200">
{`// Step 1: Create a ref
const callbackRef = useRef<() => void>();

// Step 2: Update it on every render (fresh closure!)
useEffect(() => {
  callbackRef.current = () => {
    console.log(latestState); // Always fresh!
  };
}); // No dependencies = runs every render

// Step 3: Stable callback that calls the ref
const stableCallback = useCallback(() => {
  callbackRef.current?.();
}, []); // Empty = never changes

// Result: stableCallback is stable (good for memo)
// but always calls the latest closure (fresh state!)`}
        </pre>
      </div>

      {/* Why it works */}
      <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
        <h3 className="mb-3 font-semibold text-blue-700 dark:text-blue-400">
          Why Does This Work?
        </h3>
        <ul className="space-y-2 text-sm text-blue-600 dark:text-blue-500">
          <li className="flex items-start gap-2">
            <span>•</span>
            <span>
              <strong>Refs are mutable:</strong> We can change ref.current
              without causing re-renders
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span>•</span>
            <span>
              <strong>Refs persist:</strong> The same ref object exists across
              all renders
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span>•</span>
            <span>
              <strong>Closures capture refs:</strong> The stable callback
              captures the ref <em>object</em>, not its current value
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span>•</span>
            <span>
              <strong>Latest at call time:</strong> When the stable callback
              runs, it reads ref.current which has the latest closure
            </span>
          </li>
        </ul>
      </div>

      {/* Demo 1 */}
      <div className="mb-6">
        <FormWithRefEscape />
      </div>

      {/* Demo 2 */}
      <div className="mb-6">
        <FormWithHook />
      </div>

      {/* Custom hook code */}
      <div className="mb-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
        <h3 className="mb-3 font-semibold">useEventCallback Hook</h3>
        <pre className="overflow-x-auto text-xs text-zinc-600 dark:text-zinc-400">
{`function useEventCallback<T extends (...args: any[]) => any>(
  callback: T
): T {
  const ref = useRef<T>(callback);

  // Update ref on every render
  useEffect(() => {
    ref.current = callback;
  });

  // Return stable wrapper
  return useCallback((...args: Parameters<T>) => {
    return ref.current(...args);
  }, []) as T;
}

// Usage - so clean!
const handleSubmit = useEventCallback(() => {
  console.log(name, email); // Always fresh!
});

// handleSubmit is stable - safe to pass to memo'd components`}
        </pre>
      </div>

      {/* Comparison */}
      <div className="mb-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
        <h3 className="mb-3 font-semibold">Before vs After</h3>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <h4 className="mb-2 font-medium text-red-500">❌ Before (Broken)</h4>
            <pre className="rounded bg-red-50 p-2 text-red-600 dark:bg-red-900/20 dark:text-red-400">
{`// Dilemma: can't have both!

// Option 1: Fresh but unstable
const onClick = useCallback(() => {
  submit(formData);
}, [formData]); // Changes often!

// Option 2: Stable but stale
const onClick = useCallback(() => {
  submit(formData); // Stale!
}, []); // Never changes`}
            </pre>
          </div>
          <div>
            <h4 className="mb-2 font-medium text-emerald-500">✅ After (Works!)</h4>
            <pre className="rounded bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
{`// Best of both worlds!

const ref = useRef();
useEffect(() => {
  ref.current = () => {
    submit(formData); // Fresh!
  };
});

const onClick = useCallback(() => {
  ref.current?.();
}, []); // Stable!`}
            </pre>
          </div>
        </div>
      </div>

      {/* When to use */}
      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
        <h3 className="mb-3 font-semibold">When to Use This Pattern</h3>
        <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
          <li className="flex items-start gap-2">
            <span className="text-emerald-500">✓</span>
            <span>
              Event handlers passed to memoized components
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500">✓</span>
            <span>
              Callbacks that need both stability and fresh state
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500">✓</span>
            <span>
              Debounced/throttled callbacks that access changing state
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500">✓</span>
            <span>
              Third-party library callbacks where you can&apos;t control re-renders
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-zinc-400">○</span>
            <span className="text-zinc-400">
              Regular handlers - just use useCallback with deps (simpler)
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ChapterTenOptimised;

