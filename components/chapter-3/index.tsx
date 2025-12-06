"use client";

import { useState } from "react";
import { LoadingIcon, ErrorIcon, WarningIcon, CheckIcon } from "./icons";

// ❌ THE PROBLEM: Button with too many configuration props
// This approach quickly becomes unmanageable as requirements grow
type ButtonWithConfigPropsType = {
  children: React.ReactNode;
  // Icon configuration props - this list keeps growing!
  isLoading?: boolean;
  iconName?: "loading" | "error" | "warning" | "check" | "none";
  iconColor?: "white" | "black" | "red" | "blue" | "yellow" | "green";
  iconSize?: "small" | "medium" | "large";
  iconPosition?: "left" | "right";
  // Button props
  appearance?: "primary" | "secondary";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  onClick?: () => void;
};

// This component has become a mess with all these configuration props!
const ButtonWithConfigProps = ({
  children,
  isLoading = false,
  iconName = "none",
  iconColor = "black",
  iconSize = "medium",
  iconPosition = "right",
  appearance = "primary",
  size = "medium",
  disabled = false,
  onClick,
}: ButtonWithConfigPropsType) => {
  // Determine which icon to render - this logic keeps growing!
  const renderIcon = () => {
    if (isLoading) {
      return <LoadingIcon size={iconSize} color={iconColor} />;
    }

    switch (iconName) {
      case "loading":
        return <LoadingIcon size={iconSize} color={iconColor} />;
      case "error":
        return <ErrorIcon size={iconSize} color={iconColor} />;
      case "warning":
        return <WarningIcon size={iconSize} color={iconColor} />;
      case "check":
        return <CheckIcon size={iconSize} color={iconColor} />;
      default:
        return null;
    }
  };

  const icon = renderIcon();

  const sizeClasses = {
    small: "px-2 py-1 text-xs",
    medium: "px-4 py-2 text-sm",
    large: "px-6 py-3 text-base",
  };

  const appearanceClasses = {
    primary: "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200",
    secondary: "bg-white text-zinc-900 border border-zinc-300 hover:bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-700",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors
        disabled:opacity-50 disabled:cursor-not-allowed
        ${sizeClasses[size]}
        ${appearanceClasses[appearance]}
      `}
      aria-label={typeof children === "string" ? children : undefined}
      tabIndex={0}
    >
      {iconPosition === "left" && icon}
      {children}
      {iconPosition === "right" && icon}
    </button>
  );
};

// Demo component showing the problems with configuration props
const ChapterThree = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <div className="layout mx-auto max-w-2xl p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Chapter 3: Configuration</h1>
        <p className="mt-2 text-muted-foreground">
          This example demonstrates the problem with using configuration props
          for component customization.
        </p>
        <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-4">
          <p className="text-sm text-red-600 dark:text-red-400">
            <strong>❌ Problem:</strong> The Button component has too many props
            just to control the icon: <code className="rounded bg-red-500/20 px-1 py-0.5 text-xs">iconName</code>,{" "}
            <code className="rounded bg-red-500/20 px-1 py-0.5 text-xs">iconColor</code>,{" "}
            <code className="rounded bg-red-500/20 px-1 py-0.5 text-xs">iconSize</code>,{" "}
            <code className="rounded bg-red-500/20 px-1 py-0.5 text-xs">iconPosition</code>, etc.
            This approach doesn&apos;t scale!
          </p>
        </div>
      </div>

      {/* Code Example - The Problematic Props */}
      <div className="mb-8 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-3">
          🔴 The Problematic Button API:
        </h3>
        <pre className="text-xs overflow-x-auto text-zinc-700 dark:text-zinc-300">
{`const Button = ({
  isLoading,
  iconName,      // "loading" | "error" | "warning" | ...
  iconColor,     // "white" | "black" | "red" | ...
  iconSize,      // "small" | "medium" | "large"
  iconPosition,  // "left" | "right"
  // ... and it keeps growing!
}) => { ... }`}
        </pre>
      </div>

      {/* Examples */}
      <div className="space-y-6">
        <div className="rounded-lg border border-zinc-200 p-6 dark:border-zinc-800">
          <h3 className="text-sm font-semibold mb-4">Button Examples:</h3>
          
          <div className="space-y-4">
            {/* Loading Button */}
            <div className="flex items-center gap-4">
              <ButtonWithConfigProps
                appearance="primary"
                isLoading={isLoading}
                iconColor="white"
                onClick={handleSubmit}
              >
                {isLoading ? "Submitting..." : "Submit"}
              </ButtonWithConfigProps>
              <span className="text-xs text-muted-foreground">
                isLoading + iconColor=&quot;white&quot;
              </span>
            </div>

            {/* Error Button */}
            <div className="flex items-center gap-4">
              <ButtonWithConfigProps
                appearance="secondary"
                iconName="error"
                iconColor="red"
                iconPosition="left"
              >
                Error State
              </ButtonWithConfigProps>
              <span className="text-xs text-muted-foreground">
                iconName=&quot;error&quot; + iconColor=&quot;red&quot; + iconPosition=&quot;left&quot;
              </span>
            </div>

            {/* Warning Button */}
            <div className="flex items-center gap-4">
              <ButtonWithConfigProps
                appearance="secondary"
                iconName="warning"
                iconColor="yellow"
                iconSize="large"
              >
                Large Warning
              </ButtonWithConfigProps>
              <span className="text-xs text-muted-foreground">
                iconName=&quot;warning&quot; + iconColor=&quot;yellow&quot; + iconSize=&quot;large&quot;
              </span>
            </div>

            {/* Success Button */}
            <div className="flex items-center gap-4">
              <ButtonWithConfigProps
                appearance="primary"
                iconName="check"
                iconColor="white"
                iconSize="small"
                size="small"
              >
                Done
              </ButtonWithConfigProps>
              <span className="text-xs text-muted-foreground">
                iconName=&quot;check&quot; + iconColor=&quot;white&quot; + iconSize=&quot;small&quot;
              </span>
            </div>
          </div>
        </div>

        {/* The Growing Problem */}
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-6">
          <h3 className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-3">
            ⚠️ The Growing Problem:
          </h3>
          <ul className="space-y-2 text-sm text-amber-700 dark:text-amber-300">
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span>Day 1: Add <code className="rounded bg-amber-500/20 px-1">isLoading</code> prop for the loading icon</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span>Day 2: Add <code className="rounded bg-amber-500/20 px-1">iconName</code> to support all icons</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span>Day 3: Add <code className="rounded bg-amber-500/20 px-1">iconColor</code> for custom colors</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span>Day 4: Add <code className="rounded bg-amber-500/20 px-1">iconSize</code> for size control</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span>Day 5: Add <code className="rounded bg-amber-500/20 px-1">iconPosition</code> for left/right placement</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span>Day 6: Requests for avatars, custom icons, tooltips...</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span className="font-semibold">Result: Nobody understands the component anymore! 😱</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ChapterThree;

