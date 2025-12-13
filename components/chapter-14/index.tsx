"use client";

import { useState, useEffect } from "react";

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

// Simulated fetch with RANDOM delay to cause race conditions
const simulateFetch = (id: string): Promise<typeof issuesData["1"]> => {
  const delay = Math.random() * 2000 + 500; // 500ms - 2500ms random delay
  console.log(`[Fetch] Started for Issue ${id} (will take ${Math.round(delay)}ms)`);

  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`[Fetch] Completed for Issue ${id}`);
      resolve(issuesData[id]);
    }, delay);
  });
};

// ===========================================
// PAGE COMPONENT WITH RACE CONDITION
// ===========================================

const Page = ({ id }: { id: string }) => {
  const [data, setData] = useState<typeof issuesData["1"] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    // ❌ Race condition: if id changes while fetch is in progress,
    // the old fetch can still complete and update state!
    simulateFetch(id).then((result) => {
      console.log(`[State] Setting data for Issue ${result.id}`);
      setData(result);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="flex-1 rounded-lg border border-dashed border-blue-400 bg-blue-50 p-6 dark:border-blue-600 dark:bg-blue-900/20">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          <span className="text-blue-600 dark:text-blue-400">
            Loading Issue {id}...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
      <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-300">
        {data?.id}
      </span>
      <h3 className="mt-2 text-xl font-semibold">{data?.title}</h3>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        {data?.description}
      </p>
    </div>
  );
};

// ===========================================
// MAIN APP WITH TABS
// ===========================================

const RaceConditionApp = () => {
  const [page, setPage] = useState("1");
  const [log, setLog] = useState<string[]>([]);

  // Override console.log to capture logs
  useEffect(() => {
    const originalLog = console.log;
    console.log = (...args) => {
      originalLog(...args);
      const message = args.join(" ");
      if (message.includes("[")) {
        setLog((prev) => [...prev.slice(-10), message]);
      }
    };
    return () => {
      console.log = originalLog;
    };
  }, []);

  return (
    <div className="space-y-4">
      {/* Navigation */}
      <div className="flex gap-2">
        {["1", "2", "3"].map((id) => (
          <button
            key={id}
            onClick={() => setPage(id)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              page === id
                ? "bg-blue-500 text-white"
                : "bg-zinc-200 text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-300"
            }`}
            type="button"
          >
            Issue {id}
          </button>
        ))}
        <button
          onClick={() => setLog([])}
          className="ml-auto rounded-lg bg-zinc-100 px-3 py-1 text-xs text-zinc-500 dark:bg-zinc-800"
          type="button"
        >
          Clear Log
        </button>
      </div>

      {/* Page Content */}
      <Page id={page} />

      {/* Console Log */}
      <div className="rounded-lg bg-zinc-900 p-3">
        <p className="mb-2 text-xs font-medium text-zinc-400">Console Log:</p>
        <div className="max-h-32 overflow-y-auto space-y-0.5 font-mono text-xs">
          {log.length === 0 ? (
            <p className="text-zinc-500">Click tabs quickly to see race condition...</p>
          ) : (
            log.map((entry, i) => (
              <p
                key={i}
                className={
                  entry.includes("Started")
                    ? "text-yellow-400"
                    : entry.includes("Completed")
                    ? "text-emerald-400"
                    : "text-blue-400"
                }
              >
                {entry}
              </p>
            ))
          )}
        </div>
      </div>

      {/* Warning */}
      <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
        <p className="text-sm text-red-600 dark:text-red-400">
          <strong>❌ Race Condition:</strong> Click tabs quickly! Sometimes the
          wrong issue appears because an older fetch completes after a newer one.
        </p>
      </div>
    </div>
  );
};

// ===========================================
// MAIN COMPONENT
// ===========================================

const ChapterFourteen = () => {
  const [showApp, setShowApp] = useState(false);

  return (
    <div className="layout mx-auto max-w-2xl p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Chapter 14: Race Conditions</h1>
        <p className="mt-2 text-muted-foreground">
          This example shows how race conditions occur when navigating quickly
          between pages with async data fetching.
        </p>
        <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-4">
          <p className="text-sm text-red-600 dark:text-red-400">
            <strong>❌ Problem:</strong> When you switch tabs, old fetches can
            complete after new ones, showing stale data!
          </p>
        </div>
      </div>

      {/* What is a race condition */}
      <div className="mb-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
        <h3 className="mb-3 font-semibold">What is a Race Condition?</h3>
        <div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
          <p>
            A race condition occurs when the outcome depends on the timing of
            async operations:
          </p>
          <ol className="list-inside list-decimal space-y-1 pl-2">
            <li>Click Tab 1 → Fetch starts (takes 2s)</li>
            <li>Click Tab 2 → Fetch starts (takes 0.5s)</li>
            <li>Tab 2 fetch completes → Shows Tab 2 data ✓</li>
            <li>Tab 1 fetch completes → <strong className="text-red-500">Overwrites with Tab 1 data! ✗</strong></li>
          </ol>
        </div>
      </div>

      {/* Visual diagram */}
      <div className="mb-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
        <h3 className="mb-3 font-semibold">Timeline of a Race Condition</h3>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-16 text-zinc-500">0ms</span>
            <div className="h-4 w-32 rounded bg-blue-400" />
            <span>Tab 1 fetch starts</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-16 text-zinc-500">100ms</span>
            <div className="ml-4 h-4 w-20 rounded bg-purple-400" />
            <span>Tab 2 fetch starts (user clicked)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-16 text-zinc-500">600ms</span>
            <div className="ml-8 h-4 w-4 rounded bg-purple-600" />
            <span className="text-emerald-500">Tab 2 completes ✓</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-16 text-zinc-500">2000ms</span>
            <div className="h-4 w-4 rounded bg-blue-600" />
            <span className="text-red-500">Tab 1 completes (overwrites!) ✗</span>
          </div>
        </div>
      </div>

      {/* Demo */}
      <div className="mb-6">
        <button
          onClick={() => setShowApp(!showApp)}
          className="mb-4 rounded-lg bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600"
          type="button"
        >
          {showApp ? "Hide Demo" : "Show Race Condition Demo"}
        </button>

        {showApp && <RaceConditionApp key={Date.now()} />}
      </div>

      {/* The problematic code */}
      <div className="mb-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
        <h3 className="mb-2 font-semibold">❌ Problematic Code</h3>
        <pre className="overflow-x-auto text-xs text-zinc-600 dark:text-zinc-400">
{`const Page = ({ id }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    // ❌ No protection against race conditions!
    fetch(\`/api/issue/\${id}\`)
      .then(r => r.json())
      .then(r => {
        // This runs even if id has changed!
        setData(r); // ← Old data overwrites new!
      });
  }, [id]);
  
  return <div>{data?.title}</div>;
};`}
        </pre>
      </div>

      {/* Why it happens */}
      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
        <h3 className="mb-3 font-semibold">Why Does This Happen?</h3>
        <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
          <li className="flex items-start gap-2">
            <span className="text-red-500">1.</span>
            <span>
              Promises don&apos;t know about React&apos;s lifecycle - they complete
              regardless of component state
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-500">2.</span>
            <span>
              Each useEffect run creates a new closure, but old closures still
              have access to setData
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-500">3.</span>
            <span>
              Network latency is unpredictable - faster doesn&apos;t mean first to
              complete
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-500">4.</span>
            <span>
              React re-uses the same component instance, so stale data updates
              the current view
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ChapterFourteen;

