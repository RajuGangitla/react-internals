"use client";

import { useState, useLayoutEffect, useEffect, useRef, useCallback } from "react";

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
// NAVIGATION WITH useLayoutEffect (NO FLICKER!)
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

const ResponsiveNavWithLayoutEffect = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [lastVisibleIndex, setLastVisibleIndex] = useState(-1);
  const [showDropdown, setShowDropdown] = useState(false);

  // ✅ useLayoutEffect - runs BEFORE browser paint = NO FLICKER!
  useLayoutEffect(() => {
    const calculateVisible = () => {
      const index = getLastVisibleItem(containerRef.current);
      setLastVisibleIndex(index);
    };

    calculateVisible();

    window.addEventListener("resize", calculateVisible);
    return () => window.removeEventListener("resize", calculateVisible);
  }, []);

  // First render: show all items (for measurement) - but user won't see it!
  if (lastVisibleIndex === -1) {
    return (
      <div
        ref={containerRef}
        className="flex items-center gap-1 overflow-hidden rounded-lg border border-emerald-300 bg-white p-2 dark:border-emerald-700 dark:bg-zinc-800"
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
        className="flex items-center gap-1 overflow-hidden rounded-lg border border-emerald-300 bg-white p-2 dark:border-emerald-700 dark:bg-zinc-800"
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
            className="whitespace-nowrap rounded bg-emerald-500 px-3 py-1.5 text-sm text-white hover:bg-emerald-600"
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
// SSR-SAFE WRAPPER (for Next.js)
// ===========================================

const SSRSafeNavigation = () => {
  const [isClient, setIsClient] = useState(false);

  // This ensures we only render on the client
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    // SSR fallback - show loading or first few items
    return (
      <div className="flex items-center gap-1 rounded-lg border border-amber-300 bg-white p-2 dark:border-amber-700 dark:bg-zinc-800">
        <span className="px-3 py-1.5 text-sm text-zinc-500">Loading nav...</span>
      </div>
    );
  }

  return <ResponsiveNavWithLayoutEffect />;
};

// ===========================================
// VISUAL DEMO: Browser Tasks with useLayoutEffect
// ===========================================

const BrowserTasksDemo = () => {
  const [step, setStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const runDemo = useCallback(() => {
    setIsRunning(true);
    setStep(1);

    // Simulating useLayoutEffect (sync) behavior
    // All steps happen in one "task" before paint
    setTimeout(() => {
      setStep(2);
      setTimeout(() => {
        setStep(3);
        setTimeout(() => {
          setStep(0);
          setIsRunning(false);
        }, 1000);
      }, 500);
    }, 500);
  }, []);

  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
      <h3 className="mb-3 font-semibold">Browser Tasks with useLayoutEffect</h3>

      <div className="mb-4 flex items-center gap-2">
        <button
          onClick={runDemo}
          disabled={isRunning}
          className="rounded bg-emerald-500 px-3 py-1 text-sm text-white disabled:opacity-50"
          type="button"
        >
          {isRunning ? "Running..." : "Run Demo"}
        </button>
      </div>

      <div className="rounded border-2 border-dashed border-emerald-400 p-3">
        <p className="mb-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
          ONE TASK (synchronous - no paint between):
        </p>
        <div className="space-y-2">
          <div
            className={`rounded p-2 text-sm transition-all ${
              step >= 1
                ? "bg-emerald-500 text-white"
                : "bg-zinc-200 dark:bg-zinc-800"
            }`}
          >
            Step 1: Render all items (invisible to user!)
          </div>
          <div
            className={`rounded p-2 text-sm transition-all ${
              step >= 2
                ? "bg-emerald-500 text-white"
                : "bg-zinc-200 dark:bg-zinc-800"
            }`}
          >
            Step 2: useLayoutEffect calculates visible items
          </div>
          <div
            className={`rounded p-2 text-sm transition-all ${
              step >= 3
                ? "bg-emerald-500 text-white"
                : "bg-zinc-200 dark:bg-zinc-800"
            }`}
          >
            Step 3: Re-render with correct items
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-center">
        <span className="text-xs text-emerald-500">
          ↓ Browser PAINTS only once (final state) ↓
        </span>
      </div>

      <p className="mt-2 text-xs text-emerald-500">
        ✅ User only sees the final result - no flicker!
      </p>
    </div>
  );
};

// ===========================================
// MAIN COMPONENT
// ===========================================

const ChapterTwelveOptimised = () => {
  const [containerWidth, setContainerWidth] = useState(100);

  return (
    <div className="layout mx-auto max-w-2xl p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">
          Chapter 12: useLayoutEffect (Optimised)
        </h1>
        <p className="mt-2 text-muted-foreground">
          Using useLayoutEffect to prevent flickering when measuring DOM
          elements.
        </p>
        <div className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
          <p className="text-sm text-emerald-600 dark:text-emerald-400">
            <strong>✅ Solution:</strong> useLayoutEffect runs synchronously
            BEFORE browser paint. User never sees intermediate state!
          </p>
        </div>
      </div>

      {/* Responsive Navigation Demo */}
      <div className="mb-6">
        <h3 className="mb-3 font-semibold">
          Responsive Navigation (useLayoutEffect)
        </h3>
        <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">
          Same navigation, but with useLayoutEffect. No flicker on initial load!
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
          <ResponsiveNavWithLayoutEffect />
        </div>

        <p className="mt-2 text-xs text-emerald-500">
          ✅ Refresh the page - no flicker! Items appear correctly immediately.
        </p>
      </div>

      {/* Browser Tasks Demo */}
      <div className="mb-6">
        <BrowserTasksDemo />
      </div>

      {/* How it works */}
      <div className="mb-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
        <h3 className="mb-3 font-semibold">How useLayoutEffect Works</h3>
        <pre className="overflow-x-auto rounded bg-zinc-800 p-3 text-xs text-zinc-200">
{`// This all happens in ONE synchronous task:

// Step 1: Initial render
render(<Navigation />); // Creates DOM nodes

// Step 2: useLayoutEffect (runs immediately!)
const index = getLastVisibleItem(container);
setLastVisibleIndex(index);

// Step 3: Re-render with correct items
render(<Navigation />); // Only visible items

// → Browser PAINTS (only once, final state!)

// User never sees the intermediate state!`}
        </pre>
      </div>

      {/* SSR Note */}
      <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
        <h3 className="mb-3 font-semibold text-amber-700 dark:text-amber-400">
          ⚠️ SSR Considerations (Next.js)
        </h3>
        <p className="mb-3 text-sm text-amber-600 dark:text-amber-500">
          useLayoutEffect doesn&apos;t run on the server (no DOM!). In SSR
          environments, you&apos;ll still see a flash unless you opt out:
        </p>
        <pre className="overflow-x-auto rounded bg-zinc-800 p-3 text-xs text-zinc-200">
{`const SSRSafeComponent = () => {
  const [isClient, setIsClient] = useState(false);

  // Only runs on client
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <LoadingPlaceholder />;
  }

  return <ResponsiveNavigation />;
};`}
        </pre>

        <div className="mt-4">
          <h4 className="mb-2 text-sm font-medium text-amber-700 dark:text-amber-400">
            SSR-Safe Navigation Demo:
          </h4>
          <div style={{ width: `${containerWidth}%` }}>
            <SSRSafeNavigation />
          </div>
        </div>
      </div>

      {/* When to use */}
      <div className="mb-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
        <h3 className="mb-3 font-semibold">When to Use Each Hook</h3>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="rounded bg-blue-100 p-3 dark:bg-blue-900/30">
            <h4 className="mb-2 font-medium text-blue-700 dark:text-blue-400">
              useEffect ✓
            </h4>
            <ul className="space-y-1 text-blue-600 dark:text-blue-500">
              <li>• Data fetching</li>
              <li>• Subscriptions</li>
              <li>• Event listeners</li>
              <li>• Logging/analytics</li>
              <li>• Most side effects!</li>
            </ul>
          </div>
          <div className="rounded bg-emerald-100 p-3 dark:bg-emerald-900/30">
            <h4 className="mb-2 font-medium text-emerald-700 dark:text-emerald-400">
              useLayoutEffect ✓
            </h4>
            <ul className="space-y-1 text-emerald-600 dark:text-emerald-500">
              <li>• Measuring DOM elements</li>
              <li>• Positioning tooltips</li>
              <li>• Responsive layouts</li>
              <li>• Scroll position restore</li>
              <li>• Preventing visual flicker</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Performance warning */}
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
        <h3 className="mb-2 font-semibold text-red-700 dark:text-red-400">
          ⚡ Performance Warning
        </h3>
        <p className="text-sm text-red-600 dark:text-red-500">
          useLayoutEffect is <strong>blocking</strong> - the browser can&apos;t
          paint until it finishes. Use sparingly! For most side effects,
          useEffect is the right choice. Only use useLayoutEffect when you need
          to prevent visual glitches from DOM measurements.
        </p>
      </div>
    </div>
  );
};

export default ChapterTwelveOptimised;

