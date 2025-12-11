"use client";

import {
  useState,
  useContext,
  createContext,
  useMemo,
  useCallback,
  useReducer,
  ReactNode,
  memo,
  ComponentType,
} from "react";

// ===========================================
// CONTEXT WITH SPLIT PROVIDERS & REDUCER
// ===========================================

// Types
type NavigationState = {
  isNavExpanded: boolean;
};

type NavigationApi = {
  open: () => void;
  close: () => void;
  toggle: () => void;
};

type NavigationAction =
  | { type: "open-sidebar" }
  | { type: "close-sidebar" }
  | { type: "toggle-sidebar" };

// Split Contexts - Data and API separated!
const NavigationDataContext = createContext<NavigationState>({
  isNavExpanded: true,
});

const NavigationApiContext = createContext<NavigationApi>({
  open: () => {},
  close: () => {},
  toggle: () => {},
});

// Reducer - functions don't depend on state!
const navigationReducer = (
  state: NavigationState,
  action: NavigationAction
): NavigationState => {
  switch (action.type) {
    case "open-sidebar":
      return { ...state, isNavExpanded: true };
    case "close-sidebar":
      return { ...state, isNavExpanded: false };
    case "toggle-sidebar":
      return { ...state, isNavExpanded: !state.isNavExpanded };
    default:
      return state;
  }
};

// Navigation Provider - with memoized values
const NavigationProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(navigationReducer, {
    isNavExpanded: true,
  });

  // API never changes - no dependencies on state!
  const api = useMemo<NavigationApi>(
    () => ({
      open: () => dispatch({ type: "open-sidebar" }),
      close: () => dispatch({ type: "close-sidebar" }),
      toggle: () => dispatch({ type: "toggle-sidebar" }),
    }),
    []
  );

  // Data changes with state - memoized
  const data = useMemo(() => ({ isNavExpanded: state.isNavExpanded }), [state.isNavExpanded]);

  return (
    <NavigationDataContext.Provider value={data}>
      <NavigationApiContext.Provider value={api}>
        {children}
      </NavigationApiContext.Provider>
    </NavigationDataContext.Provider>
  );
};

// Custom hooks for consuming context
const useNavigationData = () => useContext(NavigationDataContext);
const useNavigationApi = () => useContext(NavigationApiContext);

// ===========================================
// HOC SELECTOR - For components that only need API
// ===========================================

// HOC that provides navigation API without re-renders on state change
const withNavigationApi = <P extends { navApi?: NavigationApi }>(
  Component: ComponentType<P>
) => {
  const MemoizedComponent = memo(Component);

  const WrappedComponent = (props: Omit<P, "navApi">) => {
    const api = useNavigationApi();
    return <MemoizedComponent {...(props as P)} navApi={api} />;
  };

  WrappedComponent.displayName = `withNavigationApi(${Component.displayName || Component.name || "Component"})`;
  return WrappedComponent;
};

// ===========================================
// COMPONENTS
// ===========================================

// VerySlowComponent - simulates expensive rendering
const VerySlowComponent = memo(({ name }: { name: string }) => {
  const startTime = performance.now();
  while (performance.now() - startTime < 50) {
    // Artificial delay
  }

  return (
    <div className="rounded-lg border border-dashed border-emerald-500/50 bg-emerald-500/10 p-3">
      <span className="text-sm text-emerald-600 dark:text-emerald-400">
        🚀 {name} (50ms render)
      </span>
      <span className="ml-2 text-xs text-emerald-500/70">
        {new Date().toLocaleTimeString()}
      </span>
    </div>
  );
});
VerySlowComponent.displayName = "VerySlowComponent";

// AdjustableColumnsBlock - uses NavigationData context
const AdjustableColumnsBlock = () => {
  // Only this component subscribes to the data!
  const { isNavExpanded } = useNavigationData();

  return (
    <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
      <h4 className="mb-2 text-sm font-medium text-zinc-500">
        Columns Block (uses Context)
      </h4>
      <div
        className={`grid gap-2 ${isNavExpanded ? "grid-cols-2" : "grid-cols-3"}`}
      >
        {Array.from({ length: isNavExpanded ? 4 : 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded bg-emerald-100 p-3 text-center text-xs dark:bg-emerald-900/30"
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

// MainPart - NO PROPS needed! Children as props pattern
const MainPart = () => {
  return (
    <div className="flex-1 space-y-3 p-4">
      <h3 className="font-semibold text-zinc-700 dark:text-zinc-300">
        Main Content
      </h3>

      {/* These DON'T re-render on toggle anymore! */}
      <VerySlowComponent name="SlowComponent 1" />
      <VerySlowComponent name="SlowComponent 2" />
      <VerySlowComponent name="SlowComponent 3" />

      {/* Only THIS component re-renders - it uses the context */}
      <AdjustableColumnsBlock />
    </div>
  );
};

// ExpandButton - uses both Data and API contexts
const ExpandButton = () => {
  const { isNavExpanded } = useNavigationData();
  const { toggle } = useNavigationApi();

  return (
    <button
      onClick={toggle}
      className="w-full rounded-lg bg-emerald-500 px-3 py-2 text-sm text-white transition-colors hover:bg-emerald-600"
      type="button"
      aria-expanded={isNavExpanded}
    >
      {isNavExpanded ? "◀ Collapse" : "▶ Expand"}
    </button>
  );
};

// Sidebar - NO PROPS needed!
const Sidebar = () => {
  const { isNavExpanded } = useNavigationData();

  return (
    <div
      className={`border-r border-zinc-200 bg-zinc-50 p-4 transition-all dark:border-zinc-700 dark:bg-zinc-900 ${
        isNavExpanded ? "w-48" : "w-24"
      }`}
    >
      <ExpandButton />

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
const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex min-h-[400px] overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
      {children}
    </div>
  );
};

// Demo: Heavy component that only uses API (won't re-render on state change!)
const HeavyComponentBase = ({
  navApi,
}: {
  navApi?: NavigationApi;
}) => {
  const startTime = performance.now();
  while (performance.now() - startTime < 30) {
    // Artificial delay
  }

  return (
    <button
      onClick={navApi?.close}
      className="rounded bg-purple-500 px-3 py-1 text-xs text-white hover:bg-purple-600"
      type="button"
    >
      Close Nav (HOC Selector - no re-render!)
    </button>
  );
};

const HeavyComponentWithApi = withNavigationApi(HeavyComponentBase);

// ===========================================
// MAIN COMPONENT
// ===========================================

const ChapterEightOptimised = () => {
  return (
    <div className="layout mx-auto max-w-2xl p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">
          Chapter 8: Context & Performance (Optimised)
        </h1>
        <p className="mt-2 text-muted-foreground">
          This example uses Context with split providers, useReducer, and HOC
          selectors for optimal performance.
        </p>
        <div className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
          <p className="text-sm text-emerald-600 dark:text-emerald-400">
            <strong>✅ Solution:</strong> Only components that actually USE the
            context re-render! Slow components stay untouched.
          </p>
        </div>
      </div>

      {/* Context Provider wraps everything */}
      <NavigationProvider>
        <Layout>
          {/* No props! Components get data from Context */}
          <Sidebar />
          <MainPart />
        </Layout>

        {/* Demo of HOC selector */}
        <div className="mt-4">
          <HeavyComponentWithApi />
        </div>
      </NavigationProvider>

      {/* Optimization techniques */}
      <div className="mt-8 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
        <h3 className="mb-3 font-semibold">✅ Optimizations Applied:</h3>
        <div className="space-y-3">
          <div className="rounded border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-800 dark:bg-emerald-900/20">
            <h4 className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
              1. Split Providers
            </h4>
            <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-500">
              NavigationDataContext (changes) vs NavigationApiContext (never
              changes)
            </p>
          </div>

          <div className="rounded border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
            <h4 className="text-sm font-medium text-blue-700 dark:text-blue-400">
              2. useReducer Pattern
            </h4>
            <p className="mt-1 text-xs text-blue-600 dark:text-blue-500">
              API functions (open, close, toggle) don&apos;t depend on state -
              they just dispatch actions
            </p>
          </div>

          <div className="rounded border border-purple-200 bg-purple-50 p-3 dark:border-purple-800 dark:bg-purple-900/20">
            <h4 className="text-sm font-medium text-purple-700 dark:text-purple-400">
              3. HOC Selector
            </h4>
            <p className="mt-1 text-xs text-purple-600 dark:text-purple-500">
              withNavigationApi HOC + React.memo = component uses API without
              re-rendering on state change
            </p>
          </div>

          <div className="rounded border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/20">
            <h4 className="text-sm font-medium text-amber-700 dark:text-amber-400">
              4. Memoized Provider Values
            </h4>
            <p className="mt-1 text-xs text-amber-600 dark:text-amber-500">
              useMemo for data & api values prevents re-renders from parent
              component changes
            </p>
          </div>
        </div>
      </div>

      {/* Code example */}
      <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
        <h3 className="mb-2 font-semibold">Split Provider Pattern:</h3>
        <pre className="overflow-x-auto text-xs text-zinc-600 dark:text-zinc-400">
{`// Two separate contexts
const NavigationDataContext = createContext({ isNavExpanded: true });
const NavigationApiContext = createContext({ open, close, toggle });

// Provider with useReducer
const NavigationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  
  // API NEVER changes - empty dependency array!
  const api = useMemo(() => ({
    open: () => dispatch({ type: 'open-sidebar' }),
    close: () => dispatch({ type: 'close-sidebar' }),
    toggle: () => dispatch({ type: 'toggle-sidebar' }),
  }), []); // ← No dependencies!
  
  const data = useMemo(() => ({ 
    isNavExpanded: state.isNavExpanded 
  }), [state.isNavExpanded]);
  
  return (
    <NavigationDataContext.Provider value={data}>
      <NavigationApiContext.Provider value={api}>
        {children}
      </NavigationApiContext.Provider>
    </NavigationDataContext.Provider>
  );
};

// Components that need data → useNavigationData (re-render on change)
// Components that need API → useNavigationApi (NEVER re-render)`}
        </pre>
      </div>

      {/* Re-render comparison */}
      <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
        <h3 className="mb-3 font-semibold">Re-render Comparison:</h3>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <h4 className="mb-2 font-medium text-red-500">❌ Without Context</h4>
            <ul className="space-y-1 text-zinc-500">
              <li>• Page ← re-renders</li>
              <li>• Layout ← re-renders</li>
              <li>• Sidebar ← re-renders</li>
              <li>• MainPart ← re-renders</li>
              <li>• SlowComponent 1 ← re-renders</li>
              <li>• SlowComponent 2 ← re-renders</li>
              <li>• SlowComponent 3 ← re-renders</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-2 font-medium text-emerald-500">
              ✅ With Split Context
            </h4>
            <ul className="space-y-1 text-zinc-500">
              <li className="text-emerald-500">• ExpandButton ← re-renders</li>
              <li className="text-emerald-500">• Sidebar ← re-renders</li>
              <li className="text-emerald-500">
                • AdjustableColumnsBlock ← re-renders
              </li>
              <li className="line-through">• SlowComponent 1</li>
              <li className="line-through">• SlowComponent 2</li>
              <li className="line-through">• SlowComponent 3</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChapterEightOptimised;

