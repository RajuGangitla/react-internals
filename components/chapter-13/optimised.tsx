"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from "react";

// ===========================================
// SIMULATED FETCH WITH DELAY
// ===========================================

const simulateFetch = <T,>(data: T, delay: number): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delay);
  });
};

// Simulated API data
const sidebarData = [
  { id: 1, name: "Dashboard" },
  { id: 2, name: "Projects" },
  { id: 3, name: "Settings" },
];

const issueData = {
  id: "ISSUE-123",
  title: "Fix login bug",
  description: "Users cannot login with special characters in password",
  status: "In Progress",
  assignee: "John Doe",
};

const commentsData = [
  { id: 1, author: "Alice", text: "I can reproduce this issue" },
  { id: 2, author: "Bob", text: "Working on a fix now" },
  { id: 3, author: "Charlie", text: "Fixed in PR #456" },
];

// ===========================================
// SOLUTION 1: Promise.all (fetch all, wait all)
// ===========================================

type AllData = {
  sidebar: typeof sidebarData | null;
  issue: typeof issueData | null;
  comments: typeof commentsData | null;
  loading: boolean;
  totalTime: number;
};

const useAllData = (): AllData => {
  const [data, setData] = useState<{
    sidebar: typeof sidebarData | null;
    issue: typeof issueData | null;
    comments: typeof commentsData | null;
  }>({ sidebar: null, issue: null, comments: null });
  const [loading, setLoading] = useState(true);
  const [totalTime, setTotalTime] = useState(0);

  useEffect(() => {
    const start = Date.now();
    console.log("[Promise.all] All fetches started in parallel");

    Promise.all([
      simulateFetch(sidebarData, 500),
      simulateFetch(issueData, 1000),
      simulateFetch(commentsData, 1500),
    ]).then(([sidebar, issue, comments]) => {
      const elapsed = Date.now() - start;
      console.log(`[Promise.all] All fetches completed in ${elapsed}ms`);
      setData({ sidebar, issue, comments });
      setLoading(false);
      setTotalTime(elapsed);
    });
  }, []);

  return { ...data, loading, totalTime };
};

const PromiseAllApp = () => {
  const { sidebar, issue, comments, loading, totalTime } = useAllData();

  if (loading) {
    return (
      <div className="rounded-lg border border-dashed border-emerald-400 bg-emerald-50 p-4 dark:border-emerald-600 dark:bg-emerald-900/20">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          <span className="text-sm text-emerald-600 dark:text-emerald-400">
            Loading all data in parallel...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        {/* Sidebar */}
        <div className="w-32 space-y-2 rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-900">
          <h4 className="text-xs font-medium text-zinc-500">Navigation</h4>
          {sidebar?.map((item) => (
            <div
              key={item.id}
              className="rounded bg-white px-2 py-1 text-sm dark:bg-zinc-800"
            >
              {item.name}
            </div>
          ))}
        </div>

        {/* Issue */}
        <div className="flex-1 space-y-4 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
          <div>
            <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-300">
              {issue?.id}
            </span>
            <h3 className="mt-2 text-lg font-semibold">{issue?.title}</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {issue?.description}
            </p>
          </div>

          {/* Comments */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-zinc-500">Comments</h4>
            {comments?.map((comment) => (
              <div
                key={comment.id}
                className="rounded bg-zinc-100 p-2 dark:bg-zinc-700"
              >
                <span className="font-medium text-sm">{comment.author}:</span>
                <span className="text-sm text-zinc-600 dark:text-zinc-400 ml-1">
                  {comment.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded bg-emerald-100 p-3 dark:bg-emerald-900/30">
        <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
          Total time: {totalTime}ms (parallel - wait for slowest!)
        </p>
        <p className="text-xs text-emerald-600 dark:text-emerald-500">
          max(0.5s, 1s, 1.5s) = 1.5 seconds (50% faster!)
        </p>
      </div>
    </div>
  );
};

// ===========================================
// SOLUTION 2: Parallel Promises (fetch all, render independently)
// ===========================================

const useParallelData = () => {
  const [sidebar, setSidebar] = useState<typeof sidebarData | null>(null);
  const [issue, setIssue] = useState<typeof issueData | null>(null);
  const [comments, setComments] = useState<typeof commentsData | null>(null);
  const [times, setTimes] = useState({ sidebar: 0, issue: 0, comments: 0 });

  useEffect(() => {
    const start = Date.now();
    console.log("[Parallel] All fetches started in parallel");

    // Fire all in parallel, resolve independently!
    simulateFetch(sidebarData, 500).then((data) => {
      const elapsed = Date.now() - start;
      console.log(`[Parallel] Sidebar loaded in ${elapsed}ms`);
      setSidebar(data);
      setTimes((t) => ({ ...t, sidebar: elapsed }));
    });

    simulateFetch(issueData, 1000).then((data) => {
      const elapsed = Date.now() - start;
      console.log(`[Parallel] Issue loaded in ${elapsed}ms`);
      setIssue(data);
      setTimes((t) => ({ ...t, issue: elapsed }));
    });

    simulateFetch(commentsData, 1500).then((data) => {
      const elapsed = Date.now() - start;
      console.log(`[Parallel] Comments loaded in ${elapsed}ms`);
      setComments(data);
      setTimes((t) => ({ ...t, comments: elapsed }));
    });
  }, []);

  return { sidebar, issue, comments, times };
};

const ParallelApp = () => {
  const { sidebar, issue, comments, times } = useParallelData();

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        {/* Sidebar */}
        {sidebar ? (
          <div className="w-32 space-y-2 rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-900">
            <h4 className="text-xs font-medium text-zinc-500">
              Navigation ({times.sidebar}ms)
            </h4>
            {sidebar.map((item) => (
              <div
                key={item.id}
                className="rounded bg-white px-2 py-1 text-sm dark:bg-zinc-800"
              >
                {item.name}
              </div>
            ))}
          </div>
        ) : (
          <div className="w-32 rounded-lg border border-dashed border-purple-400 bg-purple-50 p-3 dark:border-purple-600 dark:bg-purple-900/20">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
              <span className="text-xs text-purple-500">Sidebar...</span>
            </div>
          </div>
        )}

        {/* Issue + Comments */}
        <div className="flex-1 space-y-4 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
          {issue ? (
            <div>
              <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                {issue.id} ({times.issue}ms)
              </span>
              <h3 className="mt-2 text-lg font-semibold">{issue.title}</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {issue.description}
              </p>
            </div>
          ) : (
            <div className="rounded border border-dashed border-blue-400 bg-blue-50 p-3 dark:border-blue-600 dark:bg-blue-900/20">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                <span className="text-xs text-blue-500">Loading issue...</span>
              </div>
            </div>
          )}

          {comments ? (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-zinc-500">
                Comments ({times.comments}ms)
              </h4>
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="rounded bg-zinc-100 p-2 dark:bg-zinc-700"
                >
                  <span className="font-medium text-sm">{comment.author}:</span>
                  <span className="text-sm text-zinc-600 dark:text-zinc-400 ml-1">
                    {comment.text}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded border border-dashed border-amber-400 bg-amber-50 p-3 dark:border-amber-600 dark:bg-amber-900/20">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
                <span className="text-xs text-amber-500">Loading comments...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="rounded bg-blue-100 p-3 dark:bg-blue-900/30">
        <p className="text-sm font-medium text-blue-700 dark:text-blue-400">
          Progressive loading - each part renders when ready!
        </p>
        <p className="text-xs text-blue-600 dark:text-blue-500">
          Sidebar: 0.5s → Issue: 1s → Comments: 1.5s (best UX!)
        </p>
      </div>
    </div>
  );
};

// ===========================================
// SOLUTION 3: Data Providers (Context-based)
// ===========================================

// Sidebar Context
const SidebarContext = createContext<typeof sidebarData | null>(null);
const SidebarProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<typeof sidebarData | null>(null);

  useEffect(() => {
    console.log("[Provider] Sidebar fetch started");
    simulateFetch(sidebarData, 500).then(setData);
  }, []);

  return (
    <SidebarContext.Provider value={data}>{children}</SidebarContext.Provider>
  );
};
const useSidebar = () => useContext(SidebarContext);

// Issue Context
const IssueContext = createContext<typeof issueData | null>(null);
const IssueProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<typeof issueData | null>(null);

  useEffect(() => {
    console.log("[Provider] Issue fetch started");
    simulateFetch(issueData, 1000).then(setData);
  }, []);

  return <IssueContext.Provider value={data}>{children}</IssueContext.Provider>;
};
const useIssue = () => useContext(IssueContext);

// Comments Context
const CommentsContext = createContext<typeof commentsData | null>(null);
const CommentsProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<typeof commentsData | null>(null);

  useEffect(() => {
    console.log("[Provider] Comments fetch started");
    simulateFetch(commentsData, 1500).then(setData);
  }, []);

  return (
    <CommentsContext.Provider value={data}>{children}</CommentsContext.Provider>
  );
};
const useComments = () => useContext(CommentsContext);

// App using providers
const ProviderBasedApp = () => {
  const sidebar = useSidebar();
  const issue = useIssue();
  const comments = useComments();

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        {/* Sidebar */}
        {sidebar ? (
          <div className="w-32 space-y-2 rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-900">
            <h4 className="text-xs font-medium text-zinc-500">Navigation</h4>
            {sidebar.map((item) => (
              <div
                key={item.id}
                className="rounded bg-white px-2 py-1 text-sm dark:bg-zinc-800"
              >
                {item.name}
              </div>
            ))}
          </div>
        ) : (
          <div className="w-32 animate-pulse rounded-lg bg-zinc-200 p-3 dark:bg-zinc-700" />
        )}

        {/* Issue + Comments */}
        <div className="flex-1 space-y-4 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
          {issue ? (
            <div>
              <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                {issue.id}
              </span>
              <h3 className="mt-2 text-lg font-semibold">{issue.title}</h3>
            </div>
          ) : (
            <div className="animate-pulse space-y-2">
              <div className="h-4 w-20 rounded bg-zinc-200 dark:bg-zinc-600" />
              <div className="h-6 w-48 rounded bg-zinc-200 dark:bg-zinc-600" />
            </div>
          )}

          {comments ? (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-zinc-500">Comments</h4>
              {comments.map((c) => (
                <div key={c.id} className="rounded bg-zinc-100 p-2 text-sm dark:bg-zinc-700">
                  {c.author}: {c.text}
                </div>
              ))}
            </div>
          ) : (
            <div className="animate-pulse space-y-2">
              <div className="h-4 w-24 rounded bg-zinc-200 dark:bg-zinc-600" />
              <div className="h-8 rounded bg-zinc-200 dark:bg-zinc-600" />
            </div>
          )}
        </div>
      </div>

      <div className="rounded bg-purple-100 p-3 dark:bg-purple-900/30">
        <p className="text-sm font-medium text-purple-700 dark:text-purple-400">
          Data Providers - no prop drilling, parallel fetching!
        </p>
        <p className="text-xs text-purple-600 dark:text-purple-500">
          All providers mount together → all fetches start together
        </p>
      </div>
    </div>
  );
};

const ProviderApp = () => (
  <SidebarProvider>
    <IssueProvider>
      <CommentsProvider>
        <ProviderBasedApp />
      </CommentsProvider>
    </IssueProvider>
  </SidebarProvider>
);

// ===========================================
// MAIN COMPONENT
// ===========================================

const ChapterThirteenOptimised = () => {
  const [activeDemo, setActiveDemo] = useState<
    "promise-all" | "parallel" | "providers" | null
  >(null);

  return (
    <div className="layout mx-auto max-w-2xl p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Chapter 13: Data Fetching (Optimised)</h1>
        <p className="mt-2 text-muted-foreground">
          Solutions to request waterfalls: Promise.all, parallel promises, and
          data providers.
        </p>
        <div className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
          <p className="text-sm text-emerald-600 dark:text-emerald-400">
            <strong>✅ Solution:</strong> Fire all requests in parallel! Total
            time = slowest request, not sum of all.
          </p>
        </div>
      </div>

      {/* Parallel vs Sequential */}
      <div className="mb-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
        <h3 className="mb-3 font-semibold">Parallel vs Sequential Fetching</h3>
        <div className="space-y-3">
          <div>
            <p className="text-xs font-medium text-red-500 mb-1">
              ❌ Sequential (Waterfall)
            </p>
            <div className="flex items-center gap-1">
              <div className="h-4 w-12 rounded bg-purple-400" />
              <div className="h-4 w-20 rounded bg-blue-400" />
              <div className="h-4 w-28 rounded bg-amber-400" />
              <span className="text-xs text-zinc-500">= 3s total</span>
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-emerald-500 mb-1">
              ✅ Parallel
            </p>
            <div className="space-y-1">
              <div className="h-3 w-12 rounded bg-purple-400" />
              <div className="h-3 w-20 rounded bg-blue-400" />
              <div className="h-3 w-28 rounded bg-amber-400" />
            </div>
            <span className="text-xs text-zinc-500">= 1.5s total (slowest)</span>
          </div>
        </div>
      </div>

      {/* Demo buttons */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveDemo("promise-all")}
          className="rounded bg-emerald-500 px-3 py-1.5 text-sm text-white hover:bg-emerald-600"
          type="button"
        >
          Promise.all Demo
        </button>
        <button
          onClick={() => setActiveDemo("parallel")}
          className="rounded bg-blue-500 px-3 py-1.5 text-sm text-white hover:bg-blue-600"
          type="button"
        >
          Parallel Promises Demo
        </button>
        <button
          onClick={() => setActiveDemo("providers")}
          className="rounded bg-purple-500 px-3 py-1.5 text-sm text-white hover:bg-purple-600"
          type="button"
        >
          Data Providers Demo
        </button>
        {activeDemo && (
          <button
            onClick={() => setActiveDemo(null)}
            className="rounded bg-zinc-500 px-3 py-1.5 text-sm text-white hover:bg-zinc-600"
            type="button"
          >
            Reset
          </button>
        )}
      </div>

      {/* Active Demo */}
      <div className="mb-6">
        {activeDemo === "promise-all" && <PromiseAllApp key={Date.now()} />}
        {activeDemo === "parallel" && <ParallelApp key={Date.now()} />}
        {activeDemo === "providers" && <ProviderApp key={Date.now()} />}
        {!activeDemo && (
          <div className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-zinc-400 dark:border-zinc-700">
            Click a button above to see the demo
          </div>
        )}
      </div>

      {/* Solutions comparison */}
      <div className="mb-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
        <h3 className="mb-3 font-semibold">Solutions Comparison</h3>
        <div className="space-y-3 text-sm">
          <div className="rounded bg-emerald-100 p-3 dark:bg-emerald-900/30">
            <h4 className="font-medium text-emerald-700 dark:text-emerald-400">
              1. Promise.all
            </h4>
            <p className="text-xs text-emerald-600 dark:text-emerald-500">
              Fetch all in parallel, wait for all, render everything at once.
              Simple but shows nothing until all data is ready.
            </p>
          </div>
          <div className="rounded bg-blue-100 p-3 dark:bg-blue-900/30">
            <h4 className="font-medium text-blue-700 dark:text-blue-400">
              2. Parallel Promises
            </h4>
            <p className="text-xs text-blue-600 dark:text-blue-500">
              Fetch all in parallel, render each when ready. Best UX - users see
              progress. Causes multiple re-renders.
            </p>
          </div>
          <div className="rounded bg-purple-100 p-3 dark:bg-purple-900/30">
            <h4 className="font-medium text-purple-700 dark:text-purple-400">
              3. Data Providers (Context)
            </h4>
            <p className="text-xs text-purple-600 dark:text-purple-500">
              Same as parallel, but with clean architecture. No prop drilling,
              co-located data access. Best for large apps.
            </p>
          </div>
        </div>
      </div>

      {/* Code example */}
      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
        <h3 className="mb-2 font-semibold">Parallel Promises Pattern</h3>
        <pre className="overflow-x-auto text-xs text-zinc-600 dark:text-zinc-400">
{`// Fire all fetches at once, resolve independently
useEffect(() => {
  // All start at the same time!
  fetch('/sidebar').then(setSidebar);
  fetch('/issue').then(setIssue);
  fetch('/comments').then(setComments);
}, []);

// Render each when ready
return (
  <>
    {sidebar ? <Sidebar /> : <Loading />}
    {issue ? <Issue /> : <Loading />}
    {comments ? <Comments /> : <Loading />}
  </>
);`}
        </pre>
      </div>
    </div>
  );
};

export default ChapterThirteenOptimised;

