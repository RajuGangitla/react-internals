"use client";

import { useState, cloneElement, isValidElement, ReactElement } from "react";

// Icon components
type IconProps = {
  size?: "small" | "medium" | "large";
  color?: "white" | "black" | "red" | "blue";
  className?: string;
};

const sizeMap = {
  small: "w-3 h-3",
  medium: "w-4 h-4",
  large: "w-6 h-6",
};

const colorMap = {
  white: "text-white",
  black: "text-zinc-900 dark:text-zinc-100",
  red: "text-red-500",
  blue: "text-blue-500",
};

const HomeIcon = ({ size = "medium", color = "black", className = "" }: IconProps) => {
  return (
    <svg
      className={`${sizeMap[size]} ${colorMap[color]} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
};

// ❌ THE PROBLEM: Button with cloneElement trying to share state
// This approach has limitations - it's "magical" and fragile
type ButtonWithCloneProps = {
  children: React.ReactNode;
  icon?: ReactElement<IconProps>;
  appearance?: "primary" | "secondary";
  size?: "small" | "medium" | "large";
};

const ButtonWithClone = ({
  children,
  icon,
  appearance = "primary",
  size = "medium",
}: ButtonWithCloneProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const sizeClasses = {
    small: "px-2 py-1 text-xs",
    medium: "px-4 py-2 text-sm",
    large: "px-6 py-3 text-base",
  };

  const appearanceClasses = {
    primary: "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200",
    secondary: "bg-white text-zinc-900 border border-zinc-300 hover:bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-700",
  };

  // Create default props based on button appearance and size
  const defaultIconProps: IconProps = {
    size: size === "large" ? "large" : "medium",
    color: appearance === "primary" ? "white" : "black",
    // ❌ PROBLEM: How do we share isHovered state with the icon?
    // We can add className, but the icon consumer doesn't know about it!
    className: isHovered ? "scale-110 transition-transform" : "transition-transform",
  };

  // Clone the icon with merged props
  let clonedIcon = icon;
  if (icon && isValidElement(icon)) {
    const newProps = {
      ...defaultIconProps,
      ...icon.props,
    };
    clonedIcon = cloneElement(icon, newProps);
  }

  return (
    <button
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors
        ${sizeClasses[size]}
        ${appearanceClasses[appearance]}
      `}
      aria-label={typeof children === "string" ? children : undefined}
      tabIndex={0}
    >
      {children}
      {clonedIcon}
    </button>
  );
};

// Component showing the problem with sharing state via cloneElement
const ChapterFour = () => {
  const [hoverCount, setHoverCount] = useState(0);

  return (
    <div className="layout mx-auto max-w-2xl p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Chapter 4: Render Props</h1>
        <p className="mt-2 text-muted-foreground">
          This example demonstrates the limitations of elements as props and
          cloneElement when you need to share state.
        </p>
        <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-4">
          <p className="text-sm text-red-600 dark:text-red-400">
            <strong>❌ Problem:</strong> With cloneElement, we can&apos;t easily share state
            (like <code className="rounded bg-red-500/20 px-1 py-0.5 text-xs">isHovered</code>)
            with the icon in an explicit, non-magical way. The icon consumer has no control!
          </p>
        </div>
      </div>

      {/* Code Example - The Problem */}
      <div className="mb-8 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-3">
          🔴 The Problem with cloneElement:
        </h3>
        <pre className="text-xs overflow-x-auto text-zinc-700 dark:text-zinc-300">
{`const Button = ({ icon }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // ❌ How do we share isHovered with the icon?
  // cloneElement can add props, but:
  // 1. The icon might not expect those props
  // 2. It's hidden "magic" - consumers don't know
  // 3. No way for icon to react to state changes
  
  const clonedIcon = cloneElement(icon, {
    className: isHovered ? 'scale-110' : '',
    // This is hacky and fragile!
  });
  
  return <button>{clonedIcon}</button>;
};`}
        </pre>
      </div>

      <div className="space-y-6">
        {/* Example 1: Button with cloneElement limitations */}
        <section className="rounded-lg border border-zinc-200 p-6 dark:border-zinc-800">
          <h3 className="text-sm font-semibold mb-4">Button with cloneElement (Limited):</h3>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <ButtonWithClone
                appearance="primary"
                icon={<HomeIcon />}
              >
                Hover Me
              </ButtonWithClone>
              <span className="text-xs text-muted-foreground">
                Icon scales on hover (via hidden className magic)
              </span>
            </div>

            <div className="flex items-center gap-4">
              <ButtonWithClone
                appearance="secondary"
                icon={<HomeIcon />}
              >
                Hover Me Too
              </ButtonWithClone>
              <span className="text-xs text-muted-foreground">
                But how would the icon know it&apos;s being hovered?
              </span>
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
            <p className="text-xs text-amber-600 dark:text-amber-400">
              <strong>⚠️ The Scale Animation Works, But...</strong> The icon consumer has no idea
              that the Button is adding a className. What if they want to render a different
              icon when hovered? Or change color instead of scaling? They can&apos;t!
            </p>
          </div>
        </section>

        {/* Example 2: What if icon library doesn't match our props? */}
        <section className="rounded-lg border border-zinc-200 p-6 dark:border-zinc-800">
          <h3 className="text-sm font-semibold mb-4">Another Problem - Props Mismatch:</h3>
          
          <div className="rounded-lg bg-zinc-100 p-4 dark:bg-zinc-900">
            <pre className="text-xs overflow-x-auto text-zinc-700 dark:text-zinc-300">
{`// Our Button expects icons with size and color props
const defaultProps = {
  size: 'large',
  color: 'white',
};

// But what if using a library with different props?
// ❌ This won't work as expected!
<Button icon={<LibraryIcon fontSize="lg" fill="white" />} />

// The Button will try to pass size/color,
// but LibraryIcon doesn't use those props!`}
            </pre>
          </div>

          <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
            <p className="text-xs text-red-600 dark:text-red-400">
              <strong>❌ Prop Assumptions Break:</strong> cloneElement makes assumptions about
              what props the icon accepts. Different icon libraries use different prop names
              (size vs fontSize, color vs fill, etc.)
            </p>
          </div>
        </section>

        {/* The Key Questions */}
        <section className="rounded-lg border border-zinc-200 p-6 dark:border-zinc-800">
          <h3 className="text-sm font-semibold mb-4">The Key Questions:</h3>
          
          <ul className="space-y-3">
            <li className="flex items-start gap-3 text-sm">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">1</span>
              <div>
                <strong>How to share state explicitly?</strong>
                <p className="text-muted-foreground text-xs mt-1">
                  The icon consumer should be able to access isHovered and decide what to do with it.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3 text-sm">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">2</span>
              <div>
                <strong>How to handle different icon APIs?</strong>
                <p className="text-muted-foreground text-xs mt-1">
                  The consumer should be able to map our props to their icon&apos;s actual props.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3 text-sm">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">3</span>
              <div>
                <strong>How to make the data flow visible?</strong>
                <p className="text-muted-foreground text-xs mt-1">
                  cloneElement hides what&apos;s happening. We need explicit, traceable data flow.
                </p>
              </div>
            </li>
          </ul>
        </section>

        {/* ResizeDetector Problem Preview */}
        <section className="rounded-lg border border-zinc-200 p-6 dark:border-zinc-800">
          <h3 className="text-sm font-semibold mb-4">Another Use Case - Sharing Logic:</h3>
          
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              What if you want to create a reusable component that tracks browser window
              width and shares that state with its children?
            </p>

            <div className="rounded-lg bg-zinc-100 p-4 dark:bg-zinc-900">
              <pre className="text-xs overflow-x-auto text-zinc-700 dark:text-zinc-300">
{`// The ResizeDetector tracks window width
const ResizeDetector = ({ onWidthChange }) => {
  const [width, setWidth] = useState();
  
  useEffect(() => {
    const listener = () => setWidth(window.innerWidth);
    window.addEventListener("resize", listener);
    return () => window.removeEventListener("resize", listener);
  }, []);
  
  // ❌ Problem: Consumer needs their own state!
  onWidthChange(width);
};

// Consumer has to maintain duplicate state
const Layout = () => {
  const [windowWidth, setWindowWidth] = useState(0);
  return (
    <>
      <ResizeDetector onWidthChange={setWindowWidth} />
      {windowWidth > 600 ? <WideLayout /> : <NarrowLayout />}
    </>
  );
};`}
              </pre>
            </div>

            <div className="mt-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
              <p className="text-xs text-red-600 dark:text-red-400">
                <strong>❌ Messy:</strong> The consumer has to create their own state just to
                receive the width. There&apos;s duplicate state management everywhere!
              </p>
            </div>
          </div>
        </section>

        {/* Teaser for Solution */}
        <div className="rounded-lg border-2 border-dashed border-emerald-500/50 bg-emerald-500/10 p-6">
          <h3 className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 mb-2">
            💡 The Solution: Render Props
          </h3>
          <p className="text-sm text-emerald-600 dark:text-emerald-400">
            Instead of passing an element, pass a <strong>function that returns an element</strong>.
            The Button can call this function and pass any props or state it wants!
            Check the optimised version to see how →
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChapterFour;

