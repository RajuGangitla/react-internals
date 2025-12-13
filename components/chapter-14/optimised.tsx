"use client";

import { useState, useEffect, useRef } from "react";

// ===========================================
// SIMULATED FETCH WITH RANDOM DELAY
// ===========================================

const issuesData: Record<string, { id: string; title: string; description: string }> = {
  "1": {
    id: "ISSUE-1",
    title: "Login Bug",
    description: "Users cannot login with special characters",
  },
  "2": {
    id: "ISSUE-2",
    title: "Dashboard Crash",
    description: "Dashboard crashes on mobile devices",
  },
  "3": {
    id: "ISSUE-3",
    title: "Payment Failed",
    description: "Payment processing times out randomly",
  },
};

// Simulated fetch with random delay
const simulateFetch = (
  id: string,
  signal?: AbortSignal
): Promise<typeof issuesData["1"]> => {
  const delay = Math.random() * 2000 + 500;

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      resolve(issuesData[id]);
    }, delay);

    // Support AbortController
    signal?.addEventListener("abort", () => {
      clearTimeout(timeout);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });
};

// ===========================================
// SOLUTION 1: Compare result with current ID (using Ref)
// ===========================================

const PageWithRefComparison = ({ id }: { id: string }) => {
  const [data, setData] = useState<typeof issuesData["1"] | null>(null);
  const [loading, setLoading] = useState(true);
  const currentIdRef = useRef(id);

  useEffect(() => {
    // Update ref with latest id
    currentIdRef.current = id;
    setLoading(true);

    simulateFetch(id).then((result) => {
      // ✅ Only update if result matches current id
      if (currentIdRef.current === result.id.split("-")[1]) {
        setData(result);
        setLoading(false);
      }
    });
  }, [id]);

  if (loading) {
    return (
      <div className="rounded-lg border border-dashed border-emerald-400 bg-emerald-50 p-4 dark:border-emerald-600 dark:bg-emerald-900/20">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          <span className="text-sm text-emerald-600 dark:text-emerald-400">
            Loading Issue {id}...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-emerald-300 bg-white p-4 dark:border-emerald-700 dark:bg-zinc-800">
      <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
        {data?.id}
      </span>
      <h3 className="mt-2 font-semibold">{data?.title}</h3>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        {data?.description}
      </p>
    </div>
  );
};

// ===========================================
// SOLUTION 2: Cleanup function with isActive flag
// ===========================================

const PageWithCleanup = ({ id }: { id: string }) => {
  const [data, setData] = useState<typeof issuesData["1"] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ✅ Track if this effect is still "active"
    let isActive = true;
    setLoading(true);

    simulateFetch(id).then((result) => {
      // ✅ Only update if this effect run is still active
      if (isActive) {
        setData(result);
        setLoading(false);
      }
    });

    // ✅ Cleanup: mark as inactive before next effect run
    return () => {
      isActive = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="rounded-lg border border-dashed border-blue-400 bg-blue-50 p-4 dark:border-blue-600 dark:bg-blue-900/20">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          <span className="text-sm text-blue-600 dark:text-blue-400">
            Loading Issue {id}...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-blue-300 bg-white p-4 dark:border-blue-700 dark:bg-zinc-800">
      <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-300">
        {data?.id}
      </span>
      <h3 className="mt-2 font-semibold">{data?.title}</h3>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        {data?.description}
      </p>
    </div>
  );
};

// ===========================================
// SOLUTION 3: AbortController (cancel previous requests)
// ===========================================

const PageWithAbort = ({ id }: { id: string }) => {
  const [data, setData] = useState<typeof issuesData["1"] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ✅ Create AbortController for this effect run
    const controller = new AbortController();
    setLoading(true);

    simulateFetch(id, controller.signal)
      .then((result) => {
        setData(result);
        setLoading(false);
      })
      .catch((error) => {
        // ✅ Ignore abort errors
        if (error.name !== "AbortError") {
          console.error("Fetch error:", error);
        }
      });

    // ✅ Cleanup: abort the request
    return () => {
      controller.abort();
    };
  }, [id]);

  if (loading) {
    return (
      <div className="rounded-lg border border-dashed border-purple-400 bg-purple-50 p-4 dark:border-purple-600 dark:bg-purple-900/20">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
          <span className="text-sm text-purple-600 dark:text-purple-400">
            Loading Issue {id}...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-purple-300 bg-white p-4 dark:border-purple-700 dark:bg-zinc-800">
      <span className="rounded bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900 dark:text-purple-300">
        {data?.id}
      </span>
      <h3 className="mt-2 font-semibold">{data?.title}</h3>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        {data?.description}
      </p>
    </div>
  );
};

// ===========================================
// DEMO APP
// ===========================================

type Solution = "ref" | "cleanup" | "abort";

const DemoApp = ({ solution }: { solution: Solution }) => {
  const [page, setPage] = useState("1");

  const PageComponent =
    solution === "ref"
      ? PageWithRefComparison
      : solution === "cleanup"
      ? PageWithCleanup
      : PageWithAbort;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {["1", "2", "3"].map((id) => (
          <button
            key={id}
            onClick={() => setPage(id)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              page === id
                ? solution === "ref"
                  ? "bg-emerald-500 text-white"
                  : solution === "cleanup"
                  ? "bg-blue-500 text-white"
                  : "bg-purple-500 text-white"
                : "bg-zinc-200 text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-300"
            }`}
            type="button"
          >
            Issue {id}
          </button>
        ))}
      </div>

      <PageComponent id={page} />

      <p className="text-xs text-emerald-600 dark:text-emerald-400">
        ✅ Click tabs quickly - no more race conditions!
      </p>
    </div>
  );
};

// ===========================================
// MAIN COMPONENT
// ===========================================

const ChapterFourteenOptimised = () => {
  const [activeSolution, setActiveSolution] = useState<Solution | null>(null);

  return (
    <div className="layout mx-auto max-w-2xl p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Chapter 14: Race Conditions (Optimised)</h1>
        <p className="mt-2 text-muted-foreground">
          Three solutions to prevent race conditions in data fetching.
        </p>
        <div className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
          <p className="text-sm text-emerald-600 dark:text-emerald-400">
            <strong>✅ Solution:</strong> Compare results, use cleanup flags, or
            abort previous requests!
          </p>
        </div>
      </div>

      {/* Solution buttons */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveSolution("ref")}
          className={`rounded-lg px-4 py-2 text-sm ${
            activeSolution === "ref"
              ? "bg-emerald-500 text-white"
              : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400"
          }`}
          type="button"
        >
          Solution 1: Ref Comparison
        </button>
        <button
          onClick={() => setActiveSolution("cleanup")}
          className={`rounded-lg px-4 py-2 text-sm ${
            activeSolution === "cleanup"
              ? "bg-blue-500 text-white"
              : "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400"
          }`}
          type="button"
        >
          Solution 2: Cleanup Flag
        </button>
        <button
          onClick={() => setActiveSolution("abort")}
          className={`rounded-lg px-4 py-2 text-sm ${
            activeSolution === "abort"
              ? "bg-purple-500 text-white"
              : "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-400"
          }`}
          type="button"
        >
          Solution 3: AbortController
        </button>
        {activeSolution && (
          <button
            onClick={() => setActiveSolution(null)}
            className="rounded-lg bg-zinc-200 px-3 py-2 text-sm text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400"
            type="button"
          >
            Reset
          </button>
        )}
      </div>

      {/* Demo */}
      {activeSolution ? (
        <div className="mb-6">
          <DemoApp key={activeSolution + Date.now()} solution={activeSolution} />
        </div>
      ) : (
        <div className="mb-6 rounded-lg border border-dashed border-zinc-300 p-8 text-center text-zinc-400 dark:border-zinc-700">
          Select a solution above to see the demo
        </div>
      )}

      {/* Solutions explained */}
      <div className="space-y-4">
        {/* Solution 1 */}
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-900/20">
          <h3 className="mb-2 font-semibold text-emerald-700 dark:text-emerald-400">
            Solution 1: Compare with Ref
          </h3>
          <pre className="overflow-x-auto text-xs text-emerald-600 dark:text-emerald-500">
{`const currentIdRef = useRef(id);

useEffect(() => {
  currentIdRef.current = id; // Always latest
  
  fetch(\`/api/\${id}\`).then(result => {
    // ✅ Only update if still current
    if (currentIdRef.current === result.id) {
      setData(result);
    }
  });
}, [id]);`}
          </pre>
        </div>

        {/* Solution 2 */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
          <h3 className="mb-2 font-semibold text-blue-700 dark:text-blue-400">
            Solution 2: Cleanup Flag
          </h3>
          <pre className="overflow-x-auto text-xs text-blue-600 dark:text-blue-500">
{`useEffect(() => {
  let isActive = true; // ✅ Track active state
  
  fetch(\`/api/\${id}\`).then(result => {
    if (isActive) { // ✅ Only if still active
      setData(result);
    }
  });
  
  return () => {
    isActive = false; // ✅ Mark as stale
  };
}, [id]);`}
          </pre>
        </div>

        {/* Solution 3 */}
        <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-900/20">
          <h3 className="mb-2 font-semibold text-purple-700 dark:text-purple-400">
            Solution 3: AbortController
          </h3>
          <pre className="overflow-x-auto text-xs text-purple-600 dark:text-purple-500">
{`useEffect(() => {
  const controller = new AbortController();
  
  fetch(\`/api/\${id}\`, { signal: controller.signal })
    .then(r => r.json())
    .then(setData)
    .catch(err => {
      if (err.name !== 'AbortError') throw err;
    });
  
  return () => {
    controller.abort(); // ✅ Cancel request
  };
}, [id]);`}
          </pre>
        </div>
      </div>

      {/* Comparison */}
      <div className="mt-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
        <h3 className="mb-3 font-semibold">Which Solution to Use?</h3>
        <div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
          <div className="flex items-start gap-2">
            <span className="text-emerald-500">●</span>
            <span>
              <strong>Ref Comparison:</strong> Simple, works when result has
              identifying data. Good for comparing IDs/URLs.
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-500">●</span>
            <span>
              <strong>Cleanup Flag:</strong> Most versatile, works with any
              promise. Uses JavaScript closures elegantly.
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-purple-500">●</span>
            <span>
              <strong>AbortController:</strong> Best for network - actually
              cancels the request, saving bandwidth.
            </span>
          </div>
        </div>
      </div>

      {/* Bonus: Force remount */}
      <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
        <h3 className="mb-2 font-semibold text-amber-700 dark:text-amber-400">
          💡 Bonus: Force Re-mount with Key
        </h3>
        <p className="mb-2 text-sm text-amber-600 dark:text-amber-500">
          Adding a key forces React to unmount/remount, killing stale fetches:
        </p>
        <pre className="overflow-x-auto text-xs text-amber-600 dark:text-amber-500">
{`// Old component unmounts (fetch dies), new one mounts
<Page id={page} key={page} />`}
        </pre>
        <p className="mt-2 text-xs text-amber-500">
          ⚠️ Not recommended - loses state, causes extra renders. Use other
          solutions instead.
        </p>
      </div>
    </div>
  );
};

export default ChapterFourteenOptimised;

