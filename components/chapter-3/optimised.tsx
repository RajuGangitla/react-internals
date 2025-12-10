"use client";

import { useState, ReactNode, cloneElement, isValidElement, ReactElement } from "react";
import { LoadingIcon, ErrorIcon, WarningIcon, CheckIcon, AvatarIcon } from "./icons";
import { CodeBlock } from "@/components/ui/code-block";

// ✅ THE SOLUTION: Button that accepts an element as a prop
// The consumer has full control over the icon configuration
type ButtonWithIconElementProps = {
  children: React.ReactNode;
  icon?: ReactNode;
  appearance?: "primary" | "secondary";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  onClick?: () => void;
};

const ButtonWithIconElement = ({
  children,
  icon,
  appearance = "primary",
  size = "medium",
  disabled = false,
  onClick,
}: ButtonWithIconElementProps) => {
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
      {children}
      {icon}
    </button>
  );
};

// ModalDialog that accepts footer as a prop (elements as props pattern)
type ModalDialogProps = {
  children: ReactNode;
  footer: ReactNode;
  title: string;
};

const ModalDialog = ({ children, footer, title }: ModalDialogProps) => {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
      <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-700">
        <h3 className="font-semibold">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
      <div className="flex justify-end gap-2 border-t border-zinc-200 px-4 py-3 dark:border-zinc-700">
        {footer}
      </div>
    </div>
  );
};

// ThreeColumnsLayout - accepts anything in each column
type ThreeColumnsLayoutProps = {
  leftColumn: ReactNode;
  middleColumn: ReactNode;
  rightColumn: ReactNode;
};

const ThreeColumnsLayout = ({ leftColumn, middleColumn, rightColumn }: ThreeColumnsLayoutProps) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
        {leftColumn}
      </div>
      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
        {middleColumn}
      </div>
      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
        {rightColumn}
      </div>
    </div>
  );
};

// Footer component for the modal
const Footer = () => {
  return (
    <span className="text-xs text-muted-foreground">
      Footer rendered at: {new Date().toLocaleTimeString()}
    </span>
  );
};

// ✅ Button with cloneElement for default props
type IconProps = {
  size?: "small" | "medium" | "large";
  color?: "white" | "black" | "red" | "blue" | "yellow" | "green";
};

type SmartButtonProps = {
  children: React.ReactNode;
  icon?: ReactElement<IconProps>;
  appearance?: "primary" | "secondary";
  size?: "small" | "medium" | "large";
  onClick?: () => void;
};

const SmartButton = ({
  children,
  icon,
  appearance = "primary",
  size = "medium",
  onClick,
}: SmartButtonProps) => {
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
  };

  // Clone the icon with merged props (icon props override defaults)
  let clonedIcon = icon;
  if (icon && isValidElement(icon)) {
    const newProps = {
      ...defaultIconProps,
      // Icon's own props override defaults
      ...icon.props,
    };
    clonedIcon = cloneElement(icon, newProps);
  }

  return (
    <button
      onClick={onClick}
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

// Main optimised component
const ChapterThreeOptimised = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSubmit = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  // The footer is created here but only rendered when dialog is open
  // This demonstrates that creating elements is cheap - they're just objects!
  const footer = <Footer />;

  return (
    <div className="layout mx-auto max-w-2xl p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Chapter 3: Configuration (Optimised)</h1>
        <p className="mt-2 text-muted-foreground">
          This example demonstrates how elements as props solve the configuration problem.
        </p>
        <div className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
          <p className="text-sm text-emerald-600 dark:text-emerald-400">
            <strong>✅ Solution:</strong> Pass the entire icon element as a prop instead of
            multiple configuration props. The consumer controls the icon completely!
          </p>
        </div>
      </div>

      {/* Code Example - The Clean API */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-3">
          🟢 The Clean Button API:
        </h3>
        <CodeBlock
            fileName="components/chapter-3/optimised.tsx"
            code={`
const Button = ({ icon, children }) => {
  return <button>{children} {icon}</button>;
};

// Consumer has full control!
<Button icon={<LoadingIcon color="white" />} />
<Button icon={<ErrorIcon color="red" size="large" />} />
<Button icon={<AvatarIcon />} />
            `}
        />
      </div>

      <div className="space-y-8">
        {/* Section 1: Button with Elements as Props */}
        <section className="rounded-lg border border-zinc-200 p-6 dark:border-zinc-800">
          <h3 className="text-sm font-semibold mb-4">1. Button with Icon Element:</h3>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <ButtonWithIconElement
                appearance="primary"
                icon={isLoading ? <LoadingIcon color="white" /> : null}
                onClick={handleSubmit}
              >
                {isLoading ? "Submitting..." : "Submit"}
              </ButtonWithIconElement>
              <code className="text-xs text-muted-foreground">
                icon={"{<LoadingIcon color=\"white\" />}"}
              </code>
            </div>

            <div className="flex items-center gap-4">
              <ButtonWithIconElement
                appearance="secondary"
                icon={<ErrorIcon color="red" />}
              >
                Error State
              </ButtonWithIconElement>
              <code className="text-xs text-muted-foreground">
                icon={"{<ErrorIcon color=\"red\" />}"}
              </code>
            </div>

            <div className="flex items-center gap-4">
              <ButtonWithIconElement
                appearance="secondary"
                icon={<WarningIcon color="yellow" size="large" />}
              >
                Large Warning
              </ButtonWithIconElement>
              <code className="text-xs text-muted-foreground">
                icon={"{<WarningIcon size=\"large\" />}"}
              </code>
            </div>

            <div className="flex items-center gap-4">
              <ButtonWithIconElement
                appearance="primary"
                icon={<AvatarIcon />}
              >
                With Avatar
              </ButtonWithIconElement>
              <code className="text-xs text-muted-foreground">
                icon={"{<AvatarIcon />}"} — Works with any element!
              </code>
            </div>
          </div>
        </section>

        {/* Section 2: Modal Dialog with Footer Prop */}
        <section className="rounded-lg border border-zinc-200 p-6 dark:border-zinc-800">
          <h3 className="text-sm font-semibold mb-4">2. Modal Dialog with Footer Element:</h3>
          
          <button
            onClick={handleOpenDialog}
            className="mb-4 rounded-lg bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600"
            tabIndex={0}
            aria-label="Open dialog"
          >
            {isDialogOpen ? "Close Dialog" : "Open Dialog"}
          </button>

          {/* Conditional rendering - footer is created above but only rendered here */}
          {isDialogOpen ? (
            <ModalDialog
              title="Example Modal"
              footer={
                <>
                  <button
                    onClick={handleCloseDialog}
                    className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-700"
                    tabIndex={0}
                    aria-label="Cancel"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCloseDialog}
                    className="rounded-lg bg-blue-500 px-3 py-1.5 text-sm text-white hover:bg-blue-600"
                    tabIndex={0}
                    aria-label="Confirm"
                  >
                    Confirm
                  </button>
                </>
              }
            >
              <p className="text-sm text-muted-foreground">
                The footer can have one button, two buttons, links, or anything else!
                The ModalDialog component doesn&apos;t care - it just renders what you give it.
              </p>
            </ModalDialog>
          ) : null}

          <div className="mt-4 rounded-lg border border-blue-500/30 bg-blue-500/10 p-3">
            <p className="text-xs text-blue-600 dark:text-blue-400">
              <strong>💡 Key Insight:</strong> The{" "}
              <code className="rounded bg-blue-500/20 px-1">footer</code> element is created{" "}
              <em>before</em> the condition, but it only renders when the dialog is open.
              Creating elements is cheap - they&apos;re just objects in memory!
            </p>
          </div>
        </section>

        {/* Section 3: Three Columns Layout */}
        <section className="rounded-lg border border-zinc-200 p-6 dark:border-zinc-800">
          <h3 className="text-sm font-semibold mb-4">3. Three Columns Layout:</h3>
          
          <ThreeColumnsLayout
            leftColumn={
              <div>
                <h4 className="font-medium text-sm mb-2">Left Column</h4>
                <p className="text-xs text-muted-foreground">
                  This can be anything - a sidebar, navigation, etc.
                </p>
              </div>
            }
            middleColumn={
              <div>
                <h4 className="font-medium text-sm mb-2">Middle Column</h4>
                <p className="text-xs text-muted-foreground">
                  Main content area. Could use children prop for this!
                </p>
              </div>
            }
            rightColumn={
              <div>
                <h4 className="font-medium text-sm mb-2">Right Column</h4>
                <p className="text-xs text-muted-foreground">
                  Additional info, widgets, ads, etc.
                </p>
              </div>
            }
          />

          <div className="mt-4">
            <CodeBlock 
                code={`<ThreeColumnsLayout
  leftColumn={<Sidebar />}
  middleColumn={<MainContent />}
  rightColumn={<Widgets />}
/>`}
            />
          </div>
        </section>

        {/* Section 4: CloneElement for Default Props */}
        <section className="rounded-lg border border-zinc-200 p-6 dark:border-zinc-800">
          <h3 className="text-sm font-semibold mb-4">4. Default Props with cloneElement:</h3>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <SmartButton appearance="primary" icon={<LoadingIcon />}>
                Primary
              </SmartButton>
              <span className="text-xs text-muted-foreground">
                Auto-gets white icon (no color specified)
              </span>
            </div>

            <div className="flex items-center gap-4">
              <SmartButton appearance="secondary" icon={<CheckIcon />}>
                Secondary
              </SmartButton>
              <span className="text-xs text-muted-foreground">
                Auto-gets black icon (no color specified)
              </span>
            </div>

            <div className="flex items-center gap-4">
              <SmartButton appearance="primary" size="large" icon={<WarningIcon />}>
                Large Button
              </SmartButton>
              <span className="text-xs text-muted-foreground">
                Auto-gets large icon size
              </span>
            </div>

            <div className="flex items-center gap-4">
              <SmartButton appearance="secondary" icon={<ErrorIcon color="red" />}>
                Override Default
              </SmartButton>
              <span className="text-xs text-muted-foreground">
                Explicit color=&quot;red&quot; overrides the default
              </span>
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
            <p className="text-xs text-amber-600 dark:text-amber-400">
              <strong>⚠️ Caution:</strong> While cloneElement works, it can be fragile.
              It&apos;s easy to accidentally override props instead of merging them.
              Use this pattern carefully for simple cases only!
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ChapterThreeOptimised;
