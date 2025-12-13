"use client";

import { useState, useEffect } from "react";

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
// CUSTOM HOOK FOR DATA FETCHING
// ===========================================

type UseDataResult<T> = {
  data: T | null;
  loading: boolean;
  time: number;
};

const useData = <T,>(
  fetchFn: () => Promise<T>,
  name: string
): UseDataResult<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState(0);

  useEffect(() => {
    const start = Date.now();
    console.log(`[${name}] Fetch started`);

    fetchFn().then((result) => {
      const elapsed = Date.now() - start;
      console.log(`[${name}] Fetch completed in ${elapsed}ms`);
      setData(result);
      setLoading(false);
      setTime(elapsed);
    });
  }, []);

  return { data, loading, time };
};

// ===========================================
// WATERFALL COMPONENTS (BAD!)
// ===========================================

// Comments - fetches after Issue renders
const Comments = ({ onLoad }: { onLoad: (time: number) => void }) => {
  const { data, loading, time } = useData(
    () => simulateFetch(commentsData, 1500), // 1.5s delay
    "Comments"
  );

  useEffect(() => {
    if (!loading) onLoad(time);
  }, [loading, time, onLoad]);

  if (loading) {
    return (
      <div className="rounded border border-dashed border-amber-400 bg-amber-50 p-3 dark:border-amber-600 dark:bg-amber-900/20">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
          <span className="text-sm text-amber-600 dark:text-amber-400">
            Loading comments... (1.5s)
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-zinc-500">Comments</h4>
      {data?.map((comment) => (
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
  );
};

// Issue - fetches after Sidebar renders, then renders Comments
const Issue = ({ onLoad }: { onLoad: (time: number) => void }) => {
  const { data, loading, time } = useData(
    () => simulateFetch(issueData, 1000), // 1s delay
    "Issue"
  );
  const [commentsTime, setCommentsTime] = useState(0);

  useEffect(() => {
    if (!loading && commentsTime > 0) {
      onLoad(time + commentsTime);
    }
  }, [loading, time, commentsTime, onLoad]);

  if (loading) {
    return (
      <div className="flex-1 rounded-lg border border-dashed border-blue-400 bg-blue-50 p-4 dark:border-blue-600 dark:bg-blue-900/20">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          <span className="text-sm text-blue-600 dark:text-blue-400">
            Loading issue... (1s)
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
      <div>
        <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-300">
          {data?.id}
        </span>
        <h3 className="mt-2 text-lg font-semibold">{data?.title}</h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {data?.description}
        </p>
      </div>
      <div className="flex gap-4 text-sm">
        <span>
          Status: <strong>{data?.status}</strong>
        </span>
        <span>
          Assignee: <strong>{data?.assignee}</strong>
        </span>
      </div>
      {/* Comments only load AFTER Issue loads! */}
      <Comments onLoad={setCommentsTime} />
    </div>
  );
};

// Sidebar - fetches first
const Sidebar = ({
  data,
}: {
  data: typeof sidebarData | null;
}) => {
  if (!data) return null;

  return (
    <div className="w-32 space-y-2 rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-900">
      <h4 className="text-xs font-medium text-zinc-500">Navigation</h4>
      {data.map((item) => (
        <div
          key={item.id}
          className="rounded bg-white px-2 py-1 text-sm dark:bg-zinc-800"
        >
          {item.name}
        </div>
      ))}
    </div>
  );
};

// ===========================================
// WATERFALL APP
// ===========================================

const WaterfallApp = () => {
  const [timeline, setTimeline] = useState<string[]>([]);
  const [totalTime, setTotalTime] = useState(0);
  const [issueTime, setIssueTime] = useState(0);

  const { data: sidebar, loading: sidebarLoading, time: sidebarTime } = useData(
    () => simulateFetch(sidebarData, 500), // 0.5s delay
    "Sidebar"
  );

  useEffect(() => {
    if (!sidebarLoading) {
      setTimeline((prev) => [...prev, `Sidebar: ${sidebarTime}ms`]);
    }
  }, [sidebarLoading, sidebarTime]);

  useEffect(() => {
    if (issueTime > 0) {
      setTotalTime(sidebarTime + issueTime);
    }
  }, [issueTime, sidebarTime]);

  if (sidebarLoading) {
    return (
      <div className="rounded-lg border border-dashed border-purple-400 bg-purple-50 p-4 dark:border-purple-600 dark:bg-purple-900/20">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
          <span className="text-sm text-purple-600 dark:text-purple-400">
            Loading sidebar... (0.5s)
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Sidebar data={sidebar} />
        {/* Issue only loads AFTER Sidebar loads! */}
        <Issue
          onLoad={(time) => {
            setIssueTime(time);
            setTimeline((prev) => [...prev, `Issue + Comments: ${time}ms`]);
          }}
        />
      </div>

      {totalTime > 0 && (
        <div className="rounded bg-red-100 p-3 dark:bg-red-900/30">
          <p className="text-sm font-medium text-red-700 dark:text-red-400">
            Total time: {totalTime}ms (sequential!)
          </p>
          <p className="text-xs text-red-600 dark:text-red-500">
            0.5s + 1s + 1.5s = 3 seconds of waterfalls!
          </p>
        </div>
      )}
    </div>
  );
};

// ===========================================
// MAIN COMPONENT
// ===========================================

const ChapterThirteen = () => {
  const [showApp, setShowApp] = useState(false);

  return (
    <div className="layout mx-auto max-w-2xl p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Chapter 13: Data Fetching & Performance</h1>
        <p className="mt-2 text-muted-foreground">
          This example shows the request waterfall problem - sequential fetching
          that slows down your app.
        </p>
        <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-4">
          <p className="text-sm text-red-600 dark:text-red-400">
            <strong>❌ Problem:</strong> Each component waits for its parent to
            load before fetching. Total time = sum of all fetches!
          </p>
        </div>
      </div>

      {/* Waterfall explanation */}
      <div className="mb-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
        <h3 className="mb-3 font-semibold">What is a Request Waterfall?</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-4 w-16 rounded bg-purple-400" />
            <span className="text-xs">Sidebar (0.5s)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-16 rounded bg-zinc-200 dark:bg-zinc-700" />
            <div className="h-4 w-24 rounded bg-blue-400" />
            <span className="text-xs">Issue (1s) - waits for Sidebar!</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-40 rounded bg-zinc-200 dark:bg-zinc-700" />
            <div className="h-4 w-32 rounded bg-amber-400" />
            <span className="text-xs">Comments (1.5s) - waits for Issue!</span>
          </div>
        </div>
        <p className="mt-3 text-xs text-zinc-500">
          Total: 0.5 + 1 + 1.5 = <strong>3 seconds</strong> (sequential)
        </p>
      </div>

      {/* Demo */}
      <div className="mb-6">
        <div className="mb-3 flex items-center gap-2">
          <button
            onClick={() => setShowApp(!showApp)}
            className="rounded bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600"
            type="button"
          >
            {showApp ? "Reset" : "Load App (Waterfall)"}
          </button>
          <span className="text-xs text-zinc-500">
            Open console to see fetch timing
          </span>
        </div>

        {showApp && <WaterfallApp key={Date.now()} />}
      </div>

      {/* Why it happens */}
      <div className="mb-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
        <h3 className="mb-3 font-semibold">Why Does This Happen?</h3>
        <pre className="overflow-x-auto text-xs text-zinc-600 dark:text-zinc-400">
{`// Each component fetches in useEffect
const Issue = () => {
  const { data } = useData('/get-issue'); // Fetches here
  
  if (!data) return 'loading'; // Blocks children!
  
  return (
    <>
      {/* Issue content */}
      <Comments /> {/* Only renders AFTER Issue loads! */}
    </>
  );
};

// Comments useEffect only runs when Issue finishes
// → Sequential, not parallel!`}
        </pre>
      </div>

      {/* Browser limitations */}
      <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
        <h3 className="mb-2 font-semibold text-amber-700 dark:text-amber-400">
          ⚠️ Browser Limitations
        </h3>
        <p className="text-sm text-amber-600 dark:text-amber-500">
          Browsers limit parallel requests to the same host (~6 in Chrome for
          HTTP/1.1). Even if you fire more, they queue! This makes waterfalls
          even worse in large apps.
        </p>
      </div>

      {/* Common causes */}
      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
        <h3 className="mb-3 font-semibold">Common Waterfall Causes:</h3>
        <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
          <li className="flex items-start gap-2">
            <span className="text-red-500">❌</span>
            <span>
              <strong>Conditional rendering:</strong> Child only mounts after
              parent&apos;s data loads
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-500">❌</span>
            <span>
              <strong>Co-located fetching:</strong> Each component fetches its
              own data in useEffect
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-500">❌</span>
            <span>
              <strong>await in sequence:</strong> Using await one after another
              instead of Promise.all
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-500">❌</span>
            <span>
              <strong>Loading states:</strong> Returning early with loading
              state blocks child render
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ChapterThirteen;

