"use client";

import { useState, useEffect, ComponentType } from "react";

// ===========================================
// HIGHER-ORDER COMPONENTS (HOCs)
// ===========================================

// Type for components with onClick
type WithOnClick = {
  onClick?: () => void;
};

// Type for components with logText prop
type WithLogText = {
  logText?: string;
};

// -----------------------------------------
// 1. withLoggingOnClick HOC
// Intercepts onClick and logs before calling the original
// -----------------------------------------
const withLoggingOnClick = <P extends WithOnClick>(
  Component: ComponentType<P>
) => {
  const WrappedComponent = (props: P & WithLogText) => {
    const { logText, ...restProps } = props;

    const handleClick = () => {
      console.log(`📊 [LOG]: ${logText || "Component clicked"}`);
      props.onClick?.();
    };

    return <Component {...(restProps as P)} onClick={handleClick} />;
  };

  WrappedComponent.displayName = `withLoggingOnClick(${Component.displayName || Component.name || "Component"})`;
  return WrappedComponent;
};

// -----------------------------------------
// 2. withLoggingOnMount HOC
// Logs when component mounts
// -----------------------------------------
const withLoggingOnMount = <P extends object>(
  Component: ComponentType<P>,
  logMessage: string
) => {
  const WrappedComponent = (props: P) => {
    useEffect(() => {
      console.log(`🚀 [MOUNT]: ${logMessage}`);
    }, []);

    return <Component {...props} />;
  };

  WrappedComponent.displayName = `withLoggingOnMount(${Component.displayName || Component.name || "Component"})`;
  return WrappedComponent;
};

// -----------------------------------------
// 3. withSuppressKeyPress HOC
// Stops keyboard events from bubbling up
// -----------------------------------------
const withSuppressKeyPress = <P extends object>(
  Component: ComponentType<P>
) => {
  const WrappedComponent = (props: P) => {
    const handleKeyPress = (event: React.KeyboardEvent) => {
      event.stopPropagation();
    };

    return (
      <div onKeyPress={handleKeyPress}>
        <Component {...props} />
      </div>
    );
  };

  WrappedComponent.displayName = `withSuppressKeyPress(${Component.displayName || Component.name || "Component"})`;
  return WrappedComponent;
};

// ===========================================
// BASE COMPONENTS (Simple, no logging logic)
// ===========================================

// Simple Button - no logging logic at all!
const SimpleButton = ({
  onClick,
  children,
}: {
  onClick?: () => void;
  children: React.ReactNode;
}) => {
  return (
    <button
      onClick={onClick}
      className="rounded-lg bg-emerald-500 px-4 py-2 text-white transition-colors hover:bg-emerald-600"
      type="button"
    >
      {children}
    </button>
  );
};

// Simple ListItem - no logging logic!
const SimpleListItem = ({
  onClick,
  children,
}: {
  onClick?: () => void;
  children: React.ReactNode;
}) => {
  return (
    <li
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick?.()}
      className="cursor-pointer rounded-lg border border-zinc-200 bg-white p-3 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700"
      role="button"
      tabIndex={0}
    >
      {children}
    </li>
  );
};

// Simple Card - no logging logic!
const SimpleCard = ({
  onClick,
  title,
  description,
}: {
  onClick?: () => void;
  title: string;
  description: string;
}) => {
  return (
    <div
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick?.()}
      className="cursor-pointer rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800"
      role="button"
      tabIndex={0}
      aria-label={`Click ${title}`}
    >
      <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">{title}</h4>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
    </div>
  );
};

// Simple Modal - no keyboard suppression logic!
const SimpleModal = ({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEscape);
    }
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-zinc-800"
        role="document"
      >
        {children}
      </div>
    </div>
  );
};

// Component that logs on mount
const WelcomeMessage = () => {
  return (
    <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
      <p className="text-sm text-emerald-600 dark:text-emerald-400">
        👋 Welcome! This component logged when it mounted.
      </p>
    </div>
  );
};

// ===========================================
// ENHANCED COMPONENTS (Using HOCs)
// ===========================================

// Enhance with logging on click - just wrap with HOC!
const ButtonWithLogging = withLoggingOnClick(SimpleButton);
const ListItemWithLogging = withLoggingOnClick(SimpleListItem);
const CardWithLogging = withLoggingOnClick(SimpleCard);

// Enhance with keyboard suppression
const ModalWithSuppressedKeyPress = withSuppressKeyPress(SimpleModal);

// Enhance with logging on mount
const WelcomeWithMountLog = withLoggingOnMount(
  WelcomeMessage,
  "Welcome message component mounted!"
);

// ===========================================
// MAIN COMPONENT
// ===========================================

const ChapterSevenOptimised = () => {
  const [clickCount, setClickCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  const handleClick = () => {
    setClickCount((prev) => prev + 1);
  };

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  const handleToggleWelcome = () => setShowWelcome((prev) => !prev);

  return (
    <div className="layout mx-auto max-w-2xl p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">
          Chapter 7: Higher-Order Components (Optimised)
        </h1>
        <p className="mt-2 text-muted-foreground">
          This example demonstrates how HOCs can share logic across components
          without code duplication.
        </p>
        <div className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
          <p className="text-sm text-emerald-600 dark:text-emerald-400">
            <strong>✅ Solution:</strong> Higher-Order Components encapsulate
            logging logic. Components stay simple and clean. Open the console to
            see the logs!
          </p>
        </div>
      </div>

      {/* Click counter */}
      <div className="mb-6 rounded-lg bg-zinc-100 p-4 dark:bg-zinc-900">
        <p className="text-center text-lg">
          Total clicks:{" "}
          <span className="font-bold text-emerald-500">{clickCount}</span>
        </p>
      </div>

      {/* Components with HOC-based logging */}
      <div className="space-y-6">
        {/* Button with logging via HOC */}
        <div>
          <h3 className="mb-2 text-sm font-medium text-zinc-500">
            Button with HOC logging:
          </h3>
          <ButtonWithLogging onClick={handleClick} logText="Primary button clicked">
            Click Me
          </ButtonWithLogging>
        </div>

        {/* List Items with logging via HOC */}
        <div>
          <h3 className="mb-2 text-sm font-medium text-zinc-500">
            List Items with HOC logging:
          </h3>
          <ul className="space-y-2">
            <ListItemWithLogging onClick={handleClick} logText="List item 1 clicked">
              📦 Item One
            </ListItemWithLogging>
            <ListItemWithLogging onClick={handleClick} logText="List item 2 clicked">
              📦 Item Two
            </ListItemWithLogging>
          </ul>
        </div>

        {/* Cards with logging via HOC */}
        <div>
          <h3 className="mb-2 text-sm font-medium text-zinc-500">
            Cards with HOC logging:
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <CardWithLogging
              onClick={handleClick}
              logText="Feature card clicked"
              title="Feature Card"
              description="Click to interact"
            />
            <CardWithLogging
              onClick={handleClick}
              logText="Info card clicked"
              title="Info Card"
              description="Another clickable card"
            />
          </div>
        </div>

        {/* Mount logging demo */}
        <div>
          <h3 className="mb-2 text-sm font-medium text-zinc-500">
            withLoggingOnMount HOC:
          </h3>
          <button
            onClick={handleToggleWelcome}
            className="mb-3 rounded-lg bg-amber-500 px-4 py-2 text-white transition-colors hover:bg-amber-600"
            type="button"
          >
            {showWelcome ? "Hide" : "Show"} Welcome (logs on mount)
          </button>
          {showWelcome && <WelcomeWithMountLog />}
        </div>

        {/* Modal with keyboard suppression via HOC */}
        <div>
          <h3 className="mb-2 text-sm font-medium text-zinc-500">
            Modal with withSuppressKeyPress HOC:
          </h3>
          <button
            onClick={handleOpenModal}
            className="rounded-lg bg-purple-500 px-4 py-2 text-white transition-colors hover:bg-purple-600"
            type="button"
          >
            Open Modal
          </button>
        </div>
      </div>

      {/* Code comparison */}
      <div className="mt-8 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
        <h3 className="mb-2 font-semibold">✅ The Solution (HOC Pattern):</h3>
        <pre className="overflow-x-auto text-xs text-zinc-600 dark:text-zinc-400">
{`// 1. Create the HOC once:
const withLoggingOnClick = (Component) => {
  return (props) => {
    const handleClick = () => {
      console.log(props.logText);
      props.onClick?.();
    };
    return <Component {...props} onClick={handleClick} />;
  };
};

// 2. Apply to ANY component - no code changes needed!
const ButtonWithLogging = withLoggingOnClick(SimpleButton);
const ListItemWithLogging = withLoggingOnClick(SimpleListItem);
const CardWithLogging = withLoggingOnClick(SimpleCard);

// 3. Use like normal components
<ButtonWithLogging logText="Button clicked!" onClick={fn}>
  Click Me
</ButtonWithLogging>`}
        </pre>
      </div>

      {/* HOC Types */}
      <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
        <h3 className="mb-3 font-semibold">HOC Patterns Demonstrated:</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              withLoggingOnClick
            </span>
            <span className="text-zinc-600 dark:text-zinc-400">
              Intercepts onClick callback, logs data, then calls original
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="rounded bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
              withLoggingOnMount
            </span>
            <span className="text-zinc-600 dark:text-zinc-400">
              Uses useEffect to log when component mounts
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="rounded bg-purple-500/20 px-2 py-0.5 text-xs font-medium text-purple-600 dark:text-purple-400">
              withSuppressKeyPress
            </span>
            <span className="text-zinc-600 dark:text-zinc-400">
              Wraps component in div that stops keyboard event propagation
            </span>
          </div>
        </div>
      </div>

      {/* Modal */}
      <ModalWithSuppressedKeyPress isOpen={isModalOpen} onClose={handleCloseModal}>
        <h2 className="text-xl font-bold">Modal with HOC</h2>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400">
          This modal is wrapped with{" "}
          <code className="rounded bg-purple-500/20 px-1 py-0.5 text-xs text-purple-600 dark:text-purple-400">
            withSuppressKeyPress
          </code>{" "}
          HOC. Keyboard events won&apos;t bubble up to parent components.
        </p>
        <p className="mt-2 text-sm text-zinc-400 dark:text-zinc-500">
          Press Escape to close.
        </p>
        <button
          onClick={handleCloseModal}
          className="mt-4 rounded-lg bg-zinc-200 px-4 py-2 transition-colors hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600"
          type="button"
        >
          Close
        </button>
      </ModalWithSuppressedKeyPress>
    </div>
  );
};

export default ChapterSevenOptimised;

