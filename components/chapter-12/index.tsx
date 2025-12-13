"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ===========================================
// HELPER: Calculate last visible item index
// ===========================================

const getLastVisibleItem = (
  container: HTMLElement | null,
  moreButtonWidth: number = 60
): number => {
  if (!container) return -1;

  const containerWidth = container.getBoundingClientRect().width;
  const children = Array.from(container.children) as HTMLElement[];

  // Remove the "more" button from calculation
  const items = children.slice(0, -1);

  let totalWidth = 0;
  let lastVisibleIndex = -1;

  for (let i = 0; i < items.length; i++) {
    const itemWidth = items[i].getBoundingClientRect().width;
    const widthWithMore = totalWidth + itemWidth + moreButtonWidth;

    if (widthWithMore <= containerWidth) {
      lastVisibleIndex = i;
      totalWidth += itemWidth;
    } else {
      break;
    }
  }

  // If all items fit without "more" button
  if (lastVisibleIndex === items.length - 1) {
    const allItemsWidth = items.reduce(
      (sum, item) => sum + item.getBoundingClientRect().width,
      0
    );
    if (allItemsWidth <= containerWidth) {
      return items.length - 1;
    }
  }

  return lastVisibleIndex;
};

// ===========================================
// NAVIGATION WITH useEffect (FLICKERING!)
// ===========================================

type NavItem = {
  id: string;
  name: string;
  href: string;
};

const navItems: NavItem[] = [
  { id: "1", name: "Home", href: "#" },
  { id: "2", name: "Products", href: "#" },
  { id: "3", name: "Services", href: "#" },
  { id: "4", name: "About Us", href: "#" },
  { id: "5", name: "Contact", href: "#" },
  { id: "6", name: "Blog", href: "#" },
  { id: "7", name: "Careers", href: "#" },
  { id: "8", name: "Support", href: "#" },
];

const ResponsiveNavWithEffect = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [lastVisibleIndex, setLastVisibleIndex] = useState(-1);
  const [showDropdown, setShowDropdown] = useState(false);

  // ❌ useEffect - runs AFTER browser paint = FLICKER!
  useEffect(() => {
    const calculateVisible = () => {
      const index = getLastVisibleItem(containerRef.current);
      setLastVisibleIndex(index);
    };

    calculateVisible();

    window.addEventListener("resize", calculateVisible);
    return () => window.removeEventListener("resize", calculateVisible);
  }, []);

  // First render: show all items (for measurement)
  if (lastVisibleIndex === -1) {
    return (
      <div
        ref={containerRef}
        className="flex items-center gap-1 overflow-hidden rounded-lg border border-red-300 bg-white p-2 dark:border-red-700 dark:bg-zinc-800"
      >
        {navItems.map((item) => (
          <a
            key={item.id}
            href={item.href}
            className="whitespace-nowrap rounded px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            {item.name}
          </a>
        ))}
        <button
          className="whitespace-nowrap rounded bg-zinc-200 px-3 py-1.5 text-sm dark:bg-zinc-600"
          type="button"
        >
          More ▼
        </button>
      </div>
    );
  }

  const visibleItems = navItems.slice(0, lastVisibleIndex + 1);
  const hiddenItems = navItems.slice(lastVisibleIndex + 1);
  const showMoreButton = hiddenItems.length > 0;

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="flex items-center gap-1 overflow-hidden rounded-lg border border-red-300 bg-white p-2 dark:border-red-700 dark:bg-zinc-800"
      >
        {visibleItems.map((item) => (
          <a
            key={item.id}
            href={item.href}
            className="whitespace-nowrap rounded px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            {item.name}
          </a>
        ))}
        {showMoreButton && (
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="whitespace-nowrap rounded bg-zinc-200 px-3 py-1.5 text-sm dark:bg-zinc-600"
            type="button"
          >
            More ▼
          </button>
        )}
      </div>

      {showDropdown && hiddenItems.length > 0 && (
        <div className="absolute right-0 top-full z-10 mt-1 rounded-lg border border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
          {hiddenItems.map((item) => (
            <a
              key={item.id}
              href={item.href}
              className="block whitespace-nowrap rounded px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              {item.name}
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

// ===========================================
// VISUAL DEMO: Browser Tasks
// ===========================================

const BrowserTasksDemo = () => {
  const [step, setStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const runDemo = useCallback(() => {
    setIsRunning(true);
    setStep(1);

    // Simulating useEffect (async) behavior
    setTimeout(() => {
      setStep(2);
      setTimeout(() => {
        setStep(3);
        setTimeout(() => {
          setStep(0);
          setIsRunning(false);
        }, 1000);
      }, 1000);
    }, 1000);
  }, []);

  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
      <h3 className="mb-3 font-semibold">Browser Tasks with useEffect</h3>

      <div className="mb-4 flex items-center gap-2">
        <button
          onClick={runDemo}
          disabled={isRunning}
          className="rounded bg-blue-500 px-3 py-1 text-sm text-white disabled:opacity-50"
          type="button"
        >
          {isRunning ? "Running..." : "Run Demo"}
        </button>
      </div>

      <div className="space-y-2">
        <div
          className={`rounded p-2 text-sm transition-all ${
            step === 1
              ? "bg-blue-500 text-white"
              : "bg-zinc-200 dark:bg-zinc-800"
          }`}
        >
          Task 1: Render all items (visible to user!) 👀
        </div>
        <div className="flex items-center justify-center py-1">
          <span
            className={`text-xs ${step >= 2 ? "text-emerald-500" : "text-zinc-400"}`}
          >
            ↓ Browser PAINTS here (flicker!) ↓
          </span>
        </div>
        <div
          className={`rounded p-2 text-sm transition-all ${
            step === 2
              ? "bg-blue-500 text-white"
              : "bg-zinc-200 dark:bg-zinc-800"
          }`}
        >
          Task 2: useEffect runs, calculates visible items
        </div>
        <div className="flex items-center justify-center py-1">
          <span
            className={`text-xs ${step >= 3 ? "text-emerald-500" : "text-zinc-400"}`}
          >
            ↓ Browser PAINTS again ↓
          </span>
        </div>
        <div
          className={`rounded p-2 text-sm transition-all ${
            step === 3
              ? "bg-emerald-500 text-white"
              : "bg-zinc-200 dark:bg-zinc-800"
          }`}
        >
          Task 3: Re-render with correct items (final state)
        </div>
      </div>

      <p className="mt-3 text-xs text-red-500">
        ❌ User sees the flicker between Task 1 and Task 3!
      </p>
    </div>
  );
};

// ===========================================
// MAIN COMPONENT
// ===========================================

const ChapterTwelve = () => {
  const [containerWidth, setContainerWidth] = useState(100);

  return (
    <div className="layout mx-auto max-w-2xl p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Chapter 12: useLayoutEffect</h1>
        <p className="mt-2 text-muted-foreground">
          This example shows the flickering problem when using useEffect for
          DOM measurements.
        </p>
        <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-4">
          <p className="text-sm text-red-600 dark:text-red-400">
            <strong>❌ Problem:</strong> useEffect runs AFTER browser paint.
            User sees all items flash briefly before they&apos;re hidden!
          </p>
        </div>
      </div>

      {/* Responsive Navigation Demo */}
      <div className="mb-6">
        <h3 className="mb-3 font-semibold">Responsive Navigation (useEffect)</h3>
        <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">
          Resize the container to see the navigation adapt. Notice the flicker
          on initial load!
        </p>

        <div className="mb-2">
          <label className="text-xs text-zinc-500">
            Container width: {containerWidth}%
          </label>
          <input
            type="range"
            min="30"
            max="100"
            value={containerWidth}
            onChange={(e) => setContainerWidth(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div style={{ width: `${containerWidth}%` }}>
          <ResponsiveNavWithEffect />
        </div>

        <p className="mt-2 text-xs text-red-500">
          ❌ Refresh the page to see the flicker - all items show briefly!
        </p>
      </div>

      {/* Browser Tasks Demo */}
      <div className="mb-6">
        <BrowserTasksDemo />
      </div>

      {/* Why it happens */}
      <div className="mb-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
        <h3 className="mb-3 font-semibold">Why Does Flickering Happen?</h3>
        <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
          <p>
            <strong>Browser rendering works in &quot;tasks&quot;:</strong>
          </p>
          <ul className="list-inside list-disc space-y-1 pl-2">
            <li>Each task is executed completely before painting</li>
            <li>
              <code className="rounded bg-zinc-200 px-1 dark:bg-zinc-700">
                useEffect
              </code>{" "}
              runs in a separate task (async)
            </li>
            <li>Browser paints between tasks → user sees intermediate state</li>
          </ul>
        </div>

        <pre className="mt-3 overflow-x-auto rounded bg-zinc-800 p-3 text-xs text-zinc-200">
{`// This is essentially what happens:

// TASK 1: Initial render
render(<Navigation />); // Shows all items
// → Browser PAINTS (user sees all items!)

// TASK 2: useEffect (setTimeout-like behavior)  
setTimeout(() => {
  const index = getLastVisibleItem(container);
  setLastVisibleIndex(index); // Triggers re-render
}, 0);
// → Browser PAINTS again (now correct)

// User sees the flash between paints!`}
        </pre>
      </div>

      {/* Synchronous vs Async */}
      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
        <h3 className="mb-3 font-semibold">Synchronous vs Asynchronous</h3>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="rounded bg-red-100 p-3 dark:bg-red-900/30">
            <h4 className="mb-2 font-medium text-red-700 dark:text-red-400">
              useEffect (Async)
            </h4>
            <ul className="space-y-1 text-red-600 dark:text-red-500">
              <li>• Runs after browser paint</li>
              <li>• Non-blocking (good for performance)</li>
              <li>• User sees intermediate states</li>
              <li>• Use for: data fetching, subscriptions</li>
            </ul>
          </div>
          <div className="rounded bg-emerald-100 p-3 dark:bg-emerald-900/30">
            <h4 className="mb-2 font-medium text-emerald-700 dark:text-emerald-400">
              useLayoutEffect (Sync)
            </h4>
            <ul className="space-y-1 text-emerald-600 dark:text-emerald-500">
              <li>• Runs before browser paint</li>
              <li>• Blocking (can hurt performance)</li>
              <li>• User only sees final state</li>
              <li>• Use for: DOM measurements, layout</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChapterTwelve;

