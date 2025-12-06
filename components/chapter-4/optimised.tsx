"use client";

import { useState, useEffect, ReactNode } from "react";

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

const HomeIconHovered = ({ size = "medium", color = "blue", className = "" }: IconProps) => {
  return (
    <svg
      className={`${sizeMap[size]} ${colorMap[color]} ${className} animate-pulse`}
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M12 2L2 12h3v8h6v-6h2v6h6v-8h3L12 2z" />
    </svg>
  );
};

// ✅ THE SOLUTION: Button with Render Props
// Instead of passing an element, pass a function that returns an element
type IconRenderProps = {
  size: "small" | "medium" | "large";
  color: "white" | "black";
};

type IconRenderState = {
  isHovered: boolean;
};

type ButtonWithRenderPropProps = {
  children: React.ReactNode;
  renderIcon?: (props: IconRenderProps, state: IconRenderState) => ReactNode;
  appearance?: "primary" | "secondary";
  size?: "small" | "medium" | "large";
};

const ButtonWithRenderProp = ({
  children,
  renderIcon,
  appearance = "primary",
  size = "medium",
}: ButtonWithRenderPropProps) => {
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

  // Default props to pass to the render function
  const iconProps: IconRenderProps = {
    size: size === "large" ? "large" : "medium",
    color: appearance === "primary" ? "white" : "black",
  };

  // State to share with the icon
  const iconState: IconRenderState = {
    isHovered,
  };

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
      {/* ✅ Call the render function with props AND state */}
      {renderIcon && renderIcon(iconProps, iconState)}
    </button>
  );
};

// ✅ ResizeDetector with children as render props
type ResizeDetectorProps = {
  children: (width: number) => ReactNode;
};

const ResizeDetector = ({ children }: ResizeDetectorProps) => {
  const [width, setWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 0);

  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ Pass width directly to children function - no duplicate state needed!
  return <>{children(width)}</>;
};

// ✅ Hook version for comparison
const useResizeDetector = () => {
  const [width, setWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 0);

  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return width;
};

// ✅ ScrollDetector - when render props are STILL useful (DOM-dependent logic)
type ScrollDetectorProps = {
  children: (scroll: number) => ReactNode;
};

const ScrollDetector = ({ children }: ScrollDetectorProps) => {
  const [scroll, setScroll] = useState(0);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScroll(e.currentTarget.scrollTop);
  };

  return (
    <div
      onScroll={handleScroll}
      className="h-40 overflow-y-auto rounded-lg border border-zinc-300 dark:border-zinc-700"
      role="region"
      aria-label="Scrollable content"
      tabIndex={0}
    >
      {children(scroll)}
    </div>
  );
};

// Layout components for demos
const WideLayout = () => (
  <div className="rounded-lg bg-emerald-500/20 p-3 text-center text-sm text-emerald-700 dark:text-emerald-400">
    🖥️ Wide Layout (width &gt; 500px)
  </div>
);

const NarrowLayout = () => (
  <div className="rounded-lg bg-amber-500/20 p-3 text-center text-sm text-amber-700 dark:text-amber-400">
    📱 Narrow Layout (width ≤ 500px)
  </div>
);

// Component using the hook version
const LayoutWithHook = () => {
  const windowWidth = useResizeDetector();

  return (
    <div>
      <p className="text-xs text-muted-foreground mb-2">
        Window width: {windowWidth}px
      </p>
      {windowWidth > 500 ? <WideLayout /> : <NarrowLayout />}
    </div>
  );
};

// Main optimised component
const ChapterFourOptimised = () => {
  return (
    <div className="layout mx-auto max-w-2xl p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Chapter 4: Render Props (Optimised)</h1>
        <p className="mt-2 text-muted-foreground">
          This example demonstrates the render props pattern for sharing state
          and flexible configuration.
        </p>
        <div className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
          <p className="text-sm text-emerald-600 dark:text-emerald-400">
            <strong>✅ Solution:</strong> Pass a <strong>function</strong> that returns an element
            instead of the element itself. The function receives props and state explicitly!
          </p>
        </div>
      </div>

      {/* Code Example - Render Props */}
      <div className="mb-8 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-3">
          🟢 The Render Props Pattern:
        </h3>
        <pre className="text-xs overflow-x-auto text-zinc-700 dark:text-zinc-300">
{`// Button passes props AND state to the render function
const Button = ({ renderIcon }) => {
  const [isHovered, setIsHovered] = useState(false);
  const iconProps = { size: 'medium', color: 'white' };
  
  return (
    <button onMouseEnter={() => setIsHovered(true)}>
      {renderIcon(iconProps, { isHovered })}
    </button>
  );
};

// Consumer has FULL control!
<Button renderIcon={(props, state) => (
  state.isHovered 
    ? <HoveredIcon {...props} /> 
    : <NormalIcon {...props} />
)} />`}
        </pre>
      </div>

      <div className="space-y-8">
        {/* Section 1: Button with Render Props */}
        <section className="rounded-lg border border-zinc-200 p-6 dark:border-zinc-800">
          <h3 className="text-sm font-semibold mb-4">1. Button with Render Props:</h3>
          
          <div className="space-y-4">
            {/* Basic usage */}
            <div className="flex items-center gap-4">
              <ButtonWithRenderProp
                appearance="primary"
                renderIcon={(props) => <HomeIcon {...props} />}
              >
                Basic Icon
              </ButtonWithRenderProp>
              <code className="text-xs text-muted-foreground">
                {`renderIcon={(props) => <Icon {...props} />}`}
              </code>
            </div>

            {/* Override props */}
            <div className="flex items-center gap-4">
              <ButtonWithRenderProp
                appearance="secondary"
                renderIcon={(props) => (
                  <HomeIcon {...props} size="large" color="red" />
                )}
              >
                Override Props
              </ButtonWithRenderProp>
              <code className="text-xs text-muted-foreground">
                Spread props, then override
              </code>
            </div>

            {/* React to hover state */}
            <div className="flex items-center gap-4">
              <ButtonWithRenderProp
                appearance="primary"
                renderIcon={(props, state) =>
                  state.isHovered ? (
                    <HomeIconHovered {...props} />
                  ) : (
                    <HomeIcon {...props} />
                  )
                }
              >
                Hover to Change Icon
              </ButtonWithRenderProp>
              <code className="text-xs text-muted-foreground">
                Different icon when hovered!
              </code>
            </div>

            {/* Apply className based on state */}
            <div className="flex items-center gap-4">
              <ButtonWithRenderProp
                appearance="secondary"
                renderIcon={(props, state) => (
                  <HomeIcon
                    {...props}
                    className={state.isHovered ? "scale-125 rotate-12 transition-transform" : "transition-transform"}
                  />
                )}
              >
                Hover for Transform
              </ButtonWithRenderProp>
              <code className="text-xs text-muted-foreground">
                Consumer controls the animation!
              </code>
            </div>

            {/* Map to different library props */}
            <div className="flex items-center gap-4">
              <ButtonWithRenderProp
                appearance="primary"
                size="large"
                renderIcon={(props) => (
                  // Consumer can map props to any icon library's API!
                  <HomeIcon
                    size={props.size}
                    color={props.color}
                  />
                )}
              >
                Map Props Explicitly
              </ButtonWithRenderProp>
              <code className="text-xs text-muted-foreground">
                Works with any icon library!
              </code>
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-blue-500/30 bg-blue-500/10 p-3">
            <p className="text-xs text-blue-600 dark:text-blue-400">
              <strong>💡 Key Insight:</strong> Everything is explicit! The consumer knows exactly
              what props and state they&apos;re receiving and can do whatever they want with them.
            </p>
          </div>
        </section>

        {/* Section 2: Children as Render Props */}
        <section className="rounded-lg border border-zinc-200 p-6 dark:border-zinc-800">
          <h3 className="text-sm font-semibold mb-4">2. Children as Render Props - ResizeDetector:</h3>
          
          <div className="rounded-lg bg-zinc-100 p-4 dark:bg-zinc-900 mb-4">
            <pre className="text-xs overflow-x-auto text-zinc-700 dark:text-zinc-300">
{`<ResizeDetector>
  {(windowWidth) => (
    windowWidth > 500 ? <WideLayout /> : <NarrowLayout />
  )}
</ResizeDetector>`}
            </pre>
          </div>

          <ResizeDetector>
            {(windowWidth) => (
              <div>
                <p className="text-xs text-muted-foreground mb-2">
                  Window width: {windowWidth}px (resize browser to see change)
                </p>
                {windowWidth > 500 ? <WideLayout /> : <NarrowLayout />}
              </div>
            )}
          </ResizeDetector>

          <div className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3">
            <p className="text-xs text-emerald-600 dark:text-emerald-400">
              <strong>✅ No Duplicate State:</strong> The consumer gets the width directly from
              ResizeDetector - no need to maintain their own state!
            </p>
          </div>
        </section>

        {/* Section 3: Hooks Replace Render Props (mostly) */}
        <section className="rounded-lg border border-zinc-200 p-6 dark:border-zinc-800">
          <h3 className="text-sm font-semibold mb-4">3. Hooks Replaced This Pattern (99% of cases):</h3>
          
          <div className="rounded-lg bg-zinc-100 p-4 dark:bg-zinc-900 mb-4">
            <pre className="text-xs overflow-x-auto text-zinc-700 dark:text-zinc-300">
{`// Hook version - cleaner and simpler!
const useResizeDetector = () => {
  const [width, setWidth] = useState(window.innerWidth);
  
  useEffect(() => {
    const listener = () => setWidth(window.innerWidth);
    window.addEventListener("resize", listener);
    return () => window.removeEventListener("resize", listener);
  }, []);
  
  return width;
};

// Usage - so much simpler!
const Layout = () => {
  const windowWidth = useResizeDetector();
  return windowWidth > 500 ? <WideLayout /> : <NarrowLayout />;
};`}
            </pre>
          </div>

          <div className="rounded-lg border border-zinc-300 p-4 dark:border-zinc-700">
            <p className="text-xs text-muted-foreground mb-2">Same result with hook:</p>
            <LayoutWithHook />
          </div>

          <div className="mt-4 rounded-lg border border-blue-500/30 bg-blue-500/10 p-3">
            <p className="text-xs text-blue-600 dark:text-blue-400">
              <strong>🎣 Hooks Win:</strong> For most state-sharing use cases, hooks are cleaner
              and easier to understand. But render props still have their place...
            </p>
          </div>
        </section>

        {/* Section 4: When Render Props Are Still Useful */}
        <section className="rounded-lg border border-zinc-200 p-6 dark:border-zinc-800">
          <h3 className="text-sm font-semibold mb-4">4. When Render Props Are Still Useful:</h3>
          
          <p className="text-sm text-muted-foreground mb-4">
            When the logic depends on a <strong>DOM element</strong> (like tracking scroll position
            in a specific container), render props can be cleaner than hooks + refs.
          </p>

          <div className="rounded-lg bg-zinc-100 p-4 dark:bg-zinc-900 mb-4">
            <pre className="text-xs overflow-x-auto text-zinc-700 dark:text-zinc-300">
{`const ScrollDetector = ({ children }) => {
  const [scroll, setScroll] = useState(0);
  
  return (
    <div onScroll={(e) => setScroll(e.currentTarget.scrollTop)}>
      {children(scroll)}
    </div>
  );
};`}
            </pre>
          </div>

          <ScrollDetector>
            {(scroll) => (
              <div className="p-4">
                <div
                  className={`
                    sticky top-0 z-10 mb-4 rounded-lg p-2 text-center text-sm font-medium transition-all
                    ${scroll > 30 
                      ? "bg-emerald-500 text-white" 
                      : "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300"
                    }
                  `}
                >
                  {scroll > 30 ? "🎉 You scrolled past 30px!" : `Scroll position: ${Math.round(scroll)}px`}
                </div>
                
                {/* Content to make it scrollable */}
                {Array.from({ length: 10 }, (_, i) => (
                  <p key={i} className="mb-4 text-sm text-muted-foreground">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Paragraph {i + 1}.
                  </p>
                ))}
              </div>
            )}
          </ScrollDetector>

          <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
            <p className="text-xs text-amber-600 dark:text-amber-400">
              <strong>📜 Scroll inside the box above!</strong> The ScrollDetector needs to render
              the scrollable div itself, so it can attach the onScroll listener. Render props
              make this natural - with hooks, you&apos;d need refs and more complexity.
            </p>
          </div>
        </section>

        {/* Key Takeaways */}
        <section className="rounded-lg border-2 border-dashed border-zinc-400 p-6 dark:border-zinc-600">
          <h3 className="text-sm font-semibold mb-4">📝 Key Takeaways:</h3>
          
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 font-bold">✓</span>
              <span>
                <strong>Render props</strong> = pass a function that returns an element instead of an element
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 font-bold">✓</span>
              <span>
                Allows explicit passing of <strong>props and state</strong> to child elements
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 font-bold">✓</span>
              <span>
                <strong>Children</strong> can also be render props: <code className="rounded bg-zinc-200 px-1 text-xs dark:bg-zinc-700">{`{children(data)}`}</code>
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 font-bold">→</span>
              <span>
                <strong>Hooks replaced</strong> this pattern for most state-sharing use cases
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 font-bold">!</span>
              <span>
                Still useful when logic is <strong>attached to a DOM element</strong> (scroll, resize of a specific element)
              </span>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default ChapterFourOptimised;

