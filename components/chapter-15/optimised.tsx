"use client";

import { useState, useCallback, Component, ReactNode } from "react";

// ===========================================
// ERROR BOUNDARY COMPONENT
// ===========================================

type ErrorBoundaryProps = {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="rounded-lg border border-red-300 bg-red-50 p-4 dark:border-red-700 dark:bg-red-900/20">
            <h3 className="font-semibold text-red-700 dark:text-red-400">
              Something went wrong
            </h3>
            <p className="mt-1 text-sm text-red-600 dark:text-red-500">
              {this.state.error?.message}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="mt-3 rounded bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600"
              type="button"
            >
              Try Again
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

// ===========================================
// HOOK: Throw async errors into React lifecycle
// ===========================================

const useThrowAsyncError = () => {
  const [, setState] = useState();

  return useCallback((error: Error) => {
    setState(() => {
      throw error;
    });
  }, []);
};

// ===========================================
// HOOK: Wrap callbacks with error handling
// ===========================================

const useCallbackWithErrorHandling = <T extends (...args: never[]) => void>(
  callback: T
) => {
  const throwAsyncError = useThrowAsyncError();

  return useCallback(
    (...args: Parameters<T>) => {
      try {
        callback(...args);
      } catch (e) {
        throwAsyncError(e as Error);
      }
    },
    [callback, throwAsyncError]
  ) as T;
};

// ===========================================
// DEMO COMPONENTS
// ===========================================

// Component that throws during render
const BuggyCounter = () => {
  const [count, setCount] = useState(0);

  if (count >= 3) {
    throw new Error("Counter crashed at 3!");
  }

  return (
    <div className="rounded bg-white p-3 dark:bg-zinc-800">
      <p>
        Count: <strong>{count}</strong>
      </p>
      <button
        onClick={() => setCount((c) => c + 1)}
        className="mt-2 rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
        type="button"
      >
        Increment (crashes at 3)
      </button>
    </div>
  );
};

// Demo 1: Basic ErrorBoundary
const BasicErrorBoundaryDemo = () => {
  const [key, setKey] = useState(0);

  return (
    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-900/20">
      <h3 className="mb-3 font-semibold text-emerald-700 dark:text-emerald-400">
        ✅ ErrorBoundary catches render errors
      </h3>
      <p className="mb-3 text-sm text-emerald-600 dark:text-emerald-500">
        Click increment until count = 3. Error is caught, not the whole app!
      </p>

      <ErrorBoundary
        key={key}
        fallback={
          <div className="rounded bg-red-100 p-3 dark:bg-red-900/30">
            <p className="text-red-600 dark:text-red-400">
              💥 Counter crashed! But the app is fine.
            </p>
            <button
              onClick={() => setKey((k) => k + 1)}
              className="mt-2 rounded bg-emerald-500 px-3 py-1 text-sm text-white"
              type="button"
            >
              Reset Counter
            </button>
          </div>
        }
      >
        <BuggyCounter />
      </ErrorBoundary>
    </div>
  );
};

// Demo 2: Async error handling with hook
const AsyncErrorDemo = () => {
  const throwAsyncError = useThrowAsyncError();
  const [isLoading, setIsLoading] = useState(false);

  const handleFetchError = () => {
    setIsLoading(true);
    // Simulate failed fetch
    setTimeout(() => {
      setIsLoading(false);
      throwAsyncError(new Error("Fetch failed! (caught by ErrorBoundary)"));
    }, 500);
  };

  return (
    <div className="rounded bg-white p-3 dark:bg-zinc-800">
      <p className="mb-2 text-sm">
        Click to simulate a failed async operation:
      </p>
      <button
        onClick={handleFetchError}
        disabled={isLoading}
        className="rounded bg-purple-500 px-3 py-1 text-sm text-white hover:bg-purple-600 disabled:opacity-50"
        type="button"
      >
        {isLoading ? "Loading..." : "Trigger Async Error"}
      </button>
    </div>
  );
};

// Demo 3: Event handler error handling
const EventHandlerDemo = () => {
  const handleDangerousClick = useCallbackWithErrorHandling(() => {
    throw new Error("Button click error! (caught by ErrorBoundary)");
  });

  return (
    <div className="rounded bg-white p-3 dark:bg-zinc-800">
      <p className="mb-2 text-sm">Click to throw error in event handler:</p>
      <button
        onClick={handleDangerousClick}
        className="rounded bg-amber-500 px-3 py-1 text-sm text-white hover:bg-amber-600"
        type="button"
      >
        Trigger Event Handler Error
      </button>
    </div>
  );
};

// Wrapped demos with their own ErrorBoundaries
const AsyncErrorDemoWithBoundary = () => {
  const [key, setKey] = useState(0);

  return (
    <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-900/20">
      <h3 className="mb-3 font-semibold text-purple-700 dark:text-purple-400">
        ✅ Catching async errors with useThrowAsyncError
      </h3>
      <ErrorBoundary
        key={key}
        fallback={
          <div className="rounded bg-red-100 p-3 dark:bg-red-900/30">
            <p className="text-red-600 dark:text-red-400">
              💥 Async error caught!
            </p>
            <button
              onClick={() => setKey((k) => k + 1)}
              className="mt-2 rounded bg-purple-500 px-3 py-1 text-sm text-white"
              type="button"
            >
              Reset
            </button>
          </div>
        }
      >
        <AsyncErrorDemo />
      </ErrorBoundary>
    </div>
  );
};

const EventHandlerDemoWithBoundary = () => {
  const [key, setKey] = useState(0);

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
      <h3 className="mb-3 font-semibold text-amber-700 dark:text-amber-400">
        ✅ Catching event handler errors
      </h3>
      <ErrorBoundary
        key={key}
        fallback={
          <div className="rounded bg-red-100 p-3 dark:bg-red-900/30">
            <p className="text-red-600 dark:text-red-400">
              💥 Event handler error caught!
            </p>
            <button
              onClick={() => setKey((k) => k + 1)}
              className="mt-2 rounded bg-amber-500 px-3 py-1 text-sm text-white"
              type="button"
            >
              Reset
            </button>
          </div>
        }
      >
        <EventHandlerDemo />
      </ErrorBoundary>
    </div>
  );
};

// ===========================================
// MAIN COMPONENT
// ===========================================

const ChapterFifteenOptimised = () => {
  return (
    <div className="layout mx-auto max-w-2xl p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Chapter 15: Error Handling (Optimised)</h1>
        <p className="mt-2 text-muted-foreground">
          Using ErrorBoundary and custom hooks to catch all errors - even async
          ones!
        </p>
        <div className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
          <p className="text-sm text-emerald-600 dark:text-emerald-400">
            <strong>✅ Solution:</strong> ErrorBoundary for render errors +
            custom hooks to throw async errors into React lifecycle!
          </p>
        </div>
      </div>

      {/* How ErrorBoundary works */}
      <div className="mb-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
        <h3 className="mb-2 font-semibold">How ErrorBoundary Works</h3>
        <pre className="overflow-x-auto text-xs text-zinc-600 dark:text-zinc-400">
{`class ErrorBoundary extends React.Component {
  state = { hasError: false };

  // Called when child throws during render
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  // Called after error - good for logging
  componentDidCatch(error, errorInfo) {
    logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <FallbackUI />;
    }
    return this.props.children;
  }
}`}
        </pre>
      </div>

      {/* Demos */}
      <div className="space-y-6">
        <BasicErrorBoundaryDemo />
        <AsyncErrorDemoWithBoundary />
        <EventHandlerDemoWithBoundary />
      </div>

      {/* The magic trick */}
      <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
        <h3 className="mb-3 font-semibold text-blue-700 dark:text-blue-400">
          🪄 The Magic Trick: useThrowAsyncError
        </h3>
        <p className="mb-3 text-sm text-blue-600 dark:text-blue-500">
          Re-throw async errors into React&apos;s lifecycle using setState&apos;s
          updater function:
        </p>
        <pre className="overflow-x-auto rounded bg-zinc-800 p-3 text-xs text-zinc-200">
{`const useThrowAsyncError = () => {
  const [, setState] = useState();

  return useCallback((error) => {
    setState(() => {
      throw error; // Thrown during setState = React lifecycle!
    });
  }, []);
};

// Usage in component
const Component = () => {
  const throwAsyncError = useThrowAsyncError();

  useEffect(() => {
    fetch('/api/data')
      .catch((e) => throwAsyncError(e)); // Now caught by ErrorBoundary!
  }, []);
};`}
        </pre>
      </div>

      {/* Callback wrapper */}
      <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
        <h3 className="mb-2 font-semibold">Wrapper for Event Handlers</h3>
        <pre className="overflow-x-auto text-xs text-zinc-600 dark:text-zinc-400">
{`const useCallbackWithErrorHandling = (callback) => {
  const throwAsyncError = useThrowAsyncError();

  return useCallback((...args) => {
    try {
      callback(...args);
    } catch (e) {
      throwAsyncError(e);
    }
  }, [callback, throwAsyncError]);
};

// Usage
const onClick = useCallbackWithErrorHandling(() => {
  doSomethingDangerous(); // Errors caught by ErrorBoundary!
});`}
        </pre>
      </div>

      {/* What catches what */}
      <div className="mt-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
        <h3 className="mb-3 font-semibold">What Catches What?</h3>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="rounded bg-emerald-100 p-3 dark:bg-emerald-900/30">
            <h4 className="mb-2 font-medium text-emerald-700 dark:text-emerald-400">
              ErrorBoundary catches:
            </h4>
            <ul className="space-y-1 text-emerald-600 dark:text-emerald-500">
              <li>✓ Errors during render</li>
              <li>✓ Errors in lifecycle methods</li>
              <li>✓ Errors in constructors</li>
              <li>✓ Errors from child components</li>
              <li>✓ Errors re-thrown via setState trick</li>
            </ul>
          </div>
          <div className="rounded bg-red-100 p-3 dark:bg-red-900/30">
            <h4 className="mb-2 font-medium text-red-700 dark:text-red-400">
              ErrorBoundary misses (without trick):
            </h4>
            <ul className="space-y-1 text-red-600 dark:text-red-500">
              <li>✗ Event handlers</li>
              <li>✗ Async code (setTimeout)</li>
              <li>✗ Promises (fetch, etc.)</li>
              <li>✗ Server-side rendering</li>
              <li>✗ Errors in ErrorBoundary itself</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Best practices */}
      <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
        <h3 className="mb-3 font-semibold">Best Practices</h3>
        <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
          <li className="flex items-start gap-2">
            <span className="text-emerald-500">✓</span>
            <span>
              Place ErrorBoundaries strategically - around routes, features, widgets
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500">✓</span>
            <span>
              Use multiple boundaries - one error shouldn&apos;t break unrelated parts
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500">✓</span>
            <span>
              Log errors to a service (Sentry, LogRocket, etc.)
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500">✓</span>
            <span>
              Provide recovery options (retry button, refresh, contact support)
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500">✓</span>
            <span>
              Use useThrowAsyncError for async errors you want caught
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ChapterFifteenOptimised;

