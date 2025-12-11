"use client";

import { useState } from "react";

// ===========================================
// THE PROBLEM: Prop Drilling & Unnecessary Re-renders
// ===========================================

// VerySlowComponent - simulates expensive rendering
const VerySlowComponent = ({ name }: { name: string }) => {
  const startTime = performance.now();
  while (performance.now() - startTime < 50) {
    // Artificial delay - blocking for 50ms
  }

  return (
    <div className="rounded-lg border border-dashed border-amber-500/50 bg-amber-500/10 p-3">
      <span className="text-sm text-amber-600 dark:text-amber-400">
        🐢 {name} (50ms render)
      </span>
      <span className="ml-2 text-xs text-amber-500/70">
        {new Date().toLocaleTimeString()}
      </span>
    </div>
  );
};

// AdjustableColumnsBlock - needs to know if sidebar is expanded
const AdjustableColumnsBlock = ({
  isNavExpanded,
}: {
  isNavExpanded: boolean;
}) => {
  return (
    <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
      <h4 className="mb-2 text-sm font-medium text-zinc-500">
        Columns Block (uses isNavExpanded)
      </h4>
      <div
        className={`grid gap-2 ${isNavExpanded ? "grid-cols-2" : "grid-cols-3"}`}
      >
        {Array.from({ length: isNavExpanded ? 4 : 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded bg-blue-100 p-3 text-center text-xs dark:bg-blue-900/30"
          >
            Col {i + 1}
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-zinc-400">
        {isNavExpanded ? "2 columns (expanded)" : "3 columns (collapsed)"}
      </p>
    </div>
  );
};

// MainPart - receives isNavExpanded just to pass it down!
// This is prop drilling - MainPart doesn't use isNavExpanded itself
const MainPart = ({ isNavExpanded }: { isNavExpanded: boolean }) => {
  return (
    <div className="flex-1 space-y-3 p-4">
      <h3 className="font-semibold text-zinc-700 dark:text-zinc-300">
        Main Content
      </h3>

      {/* These slow components re-render on every toggle! */}
      <VerySlowComponent name="SlowComponent 1" />
      <VerySlowComponent name="SlowComponent 2" />
      <VerySlowComponent name="SlowComponent 3" />

      {/* Only THIS component actually needs isNavExpanded */}
      <AdjustableColumnsBlock isNavExpanded={isNavExpanded} />
    </div>
  );
};

// ExpandButton - needs toggle function and state
const ExpandButton = ({
  isExpanded,
  onToggle,
}: {
  isExpanded: boolean;
  onToggle: () => void;
}) => {
  return (
    <button
      onClick={onToggle}
      className="w-full rounded-lg bg-blue-500 px-3 py-2 text-sm text-white transition-colors hover:bg-blue-600"
      type="button"
      aria-expanded={isExpanded}
    >
      {isExpanded ? "◀ Collapse" : "▶ Expand"}
    </button>
  );
};

// Sidebar - receives props just to pass them to ExpandButton!
// Another example of prop drilling
const Sidebar = ({
  isNavExpanded,
  toggleNav,
}: {
  isNavExpanded: boolean;
  toggleNav: () => void;
}) => {
  return (
    <div
      className={`border-r border-zinc-200 bg-zinc-50 p-4 transition-all dark:border-zinc-700 dark:bg-zinc-900 ${
        isNavExpanded ? "w-48" : "w-24"
      }`}
    >
      <ExpandButton isExpanded={isNavExpanded} onToggle={toggleNav} />

      <nav className="mt-4 space-y-2">
        <div className="rounded bg-zinc-200 px-2 py-1 text-xs dark:bg-zinc-800">
          Link 1
        </div>
        <div className="rounded bg-zinc-200 px-2 py-1 text-xs dark:bg-zinc-800">
          Link 2
        </div>
        {isNavExpanded && (
          <div className="rounded bg-zinc-200 px-2 py-1 text-xs dark:bg-zinc-800">
            Link 3
          </div>
        )}
      </nav>
    </div>
  );
};

// Layout component
const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-[400px] overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
      {children}
    </div>
  );
};

// ===========================================
// MAIN COMPONENT
// ===========================================

const ChapterEight = () => {
  // State lives at the top - causes entire tree to re-render!
  const [isNavExpanded, setIsNavExpanded] = useState(true);

  const toggleNav = () => setIsNavExpanded((prev) => !prev);

  return (
    <div className="layout mx-auto max-w-2xl p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Chapter 8: React Context & Performance</h1>
        <p className="mt-2 text-muted-foreground">
          This example shows prop drilling and unnecessary re-renders when state
          is lifted to a common parent.
        </p>
        <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-4">
          <p className="text-sm text-red-600 dark:text-red-400">
            <strong>❌ Problem:</strong> Clicking the toggle button re-renders
            ALL components including the slow ones, even though only
            ExpandButton and AdjustableColumnsBlock need the state!
          </p>
        </div>
      </div>

      {/* The problematic layout */}
      <Layout>
        {/* Props are drilled through Sidebar */}
        <Sidebar isNavExpanded={isNavExpanded} toggleNav={toggleNav} />

        {/* Props are drilled through MainPart */}
        <MainPart isNavExpanded={isNavExpanded} />
      </Layout>

      {/* Visual explanation */}
      <div className="mt-8 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
        <h3 className="mb-3 font-semibold">❌ The Prop Drilling Problem:</h3>
        <pre className="overflow-x-auto text-xs text-zinc-600 dark:text-zinc-400">
{`// State at the top level
const Page = () => {
  const [isNavExpanded, setIsNavExpanded] = useState();
  
  return (
    <Layout>
      {/* Props drilled through Sidebar */}
      <Sidebar 
        isNavExpanded={isNavExpanded}  // ← doesn't use it!
        toggleNav={toggleNav}           // ← just passes down
      />
      
      {/* Props drilled through MainPart */}
      <MainPart 
        isNavExpanded={isNavExpanded}  // ← doesn't use it!
      />                                 // ← just passes down
    </Layout>
  );
};

// When state changes:
// ❌ Page re-renders
// ❌ Layout re-renders
// ❌ Sidebar re-renders
// ❌ MainPart re-renders
// ❌ ALL VerySlowComponents re-render!
// ✅ Only ExpandButton & AdjustableColumnsBlock need the state`}
        </pre>
      </div>

      {/* Issues list */}
      <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
        <h3 className="mb-3 font-semibold">Issues with this approach:</h3>
        <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
          <li className="flex items-start gap-2">
            <span className="text-red-500">❌</span>
            <span>
              <strong>Prop drilling:</strong> Sidebar & MainPart have props they
              don&apos;t use - just pass down
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-500">❌</span>
            <span>
              <strong>API bloat:</strong> Components have unnecessary props in
              their interface
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-500">❌</span>
            <span>
              <strong>Performance:</strong> All slow components re-render on
              every toggle
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-500">❌</span>
            <span>
              <strong>Maintenance:</strong> Adding new consumers requires
              threading props through entire tree
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ChapterEight;

