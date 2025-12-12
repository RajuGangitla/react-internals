"use client";

import { useState, useEffect, useRef } from "react";

// ===========================================
// THE PROBLEM: Managing focus without proper patterns
// ===========================================

// Simple InputField - no ref forwarding, no imperative API
const InputField = ({
  label,
  onChange,
  focusItself,
}: {
  label: string;
  onChange: (value: string) => void;
  focusItself?: boolean;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Hacky way to focus - only works once when false → true
  useEffect(() => {
    if (focusItself) {
      inputRef.current?.focus();
    }
  }, [focusItself]);

  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
        {label}
      </label>
      <input
        ref={inputRef}
        type="text"
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-600 dark:bg-zinc-800"
      />
    </div>
  );
};

// Demonstration: Ref vs State difference
const RefVsStateDemo = () => {
  const [stateValue, setStateValue] = useState("");
  const refValue = useRef("");
  const [, forceRender] = useState(0);

  const handleStateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("Before setState:", stateValue);
    setStateValue(e.target.value);
    console.log("After setState:", stateValue); // Same as before!
  };

  const handleRefChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("Before ref update:", refValue.current);
    refValue.current = e.target.value;
    console.log("After ref update:", refValue.current); // Already changed!
  };

  return (
    <div className="space-y-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
      <h3 className="font-semibold">Ref vs State Demo</h3>

      <div className="grid grid-cols-2 gap-4">
        {/* State-based input */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-zinc-500">
            State-based (re-renders on every keystroke)
          </label>
          <input
            type="text"
            value={stateValue}
            onChange={handleStateChange}
            className="w-full rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-600 dark:bg-zinc-800"
            placeholder="Type here..."
          />
          <p className="text-xs text-zinc-500">
            Value: <span className="font-mono text-blue-500">{stateValue || "(empty)"}</span>
          </p>
        </div>

        {/* Ref-based input */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-zinc-500">
            Ref-based (NO re-render on keystroke)
          </label>
          <input
            type="text"
            onChange={handleRefChange}
            className="w-full rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-600 dark:bg-zinc-800"
            placeholder="Type here..."
          />
          <p className="text-xs text-zinc-500">
            Value: <span className="font-mono text-amber-500">{refValue.current || "(empty)"}</span>
            <button
              onClick={() => forceRender((n) => n + 1)}
              className="ml-2 text-xs text-blue-500 underline"
              type="button"
            >
              Force render to see
            </button>
          </p>
        </div>
      </div>

      <p className="text-xs text-zinc-400">
        Open console to see the difference in timing!
      </p>
    </div>
  );
};

// ===========================================
// MAIN COMPONENT
// ===========================================

const ChapterNine = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [focusName, setFocusName] = useState(false);
  const [focusEmail, setFocusEmail] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = () => {
    const newErrors: string[] = [];

    if (!name.trim()) {
      newErrors.push("Name is required");
      // Hacky focus - only works once!
      setFocusName(true);
    } else if (!email.trim()) {
      newErrors.push("Email is required");
      setFocusEmail(true);
    }

    setErrors(newErrors);

    if (newErrors.length === 0) {
      alert("Form submitted successfully!");
    }
  };

  // Reset focus flags after focusing (hacky!)
  useEffect(() => {
    if (focusName) {
      const timer = setTimeout(() => setFocusName(false), 100);
      return () => clearTimeout(timer);
    }
  }, [focusName]);

  useEffect(() => {
    if (focusEmail) {
      const timer = setTimeout(() => setFocusEmail(false), 100);
      return () => clearTimeout(timer);
    }
  }, [focusEmail]);

  return (
    <div className="layout mx-auto max-w-2xl p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Chapter 9: Refs & Imperative API</h1>
        <p className="mt-2 text-muted-foreground">
          This example shows the awkward patterns when not using Refs properly
          for DOM manipulation.
        </p>
        <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-4">
          <p className="text-sm text-red-600 dark:text-red-400">
            <strong>❌ Problem:</strong> Using props like `focusItself` is hacky
            and only works once. No way to trigger shake animation or proper
            imperative actions!
          </p>
        </div>
      </div>

      {/* Ref vs State Demo */}
      <RefVsStateDemo />

      {/* Form */}
      <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
        <h2 className="mb-4 text-lg font-semibold">Sign Up Form</h2>

        {errors.length > 0 && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
            {errors.map((error, i) => (
              <p key={i} className="text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            ))}
          </div>
        )}

        <div className="space-y-4">
          <InputField
            label="Name *"
            onChange={setName}
            focusItself={focusName}
          />

          <InputField
            label="Email *"
            onChange={setEmail}
            focusItself={focusEmail}
          />

          <InputField label="Twitter (optional)" onChange={() => {}} />

          <button
            onClick={handleSubmit}
            className="w-full rounded-lg bg-blue-500 py-2 text-white transition-colors hover:bg-blue-600"
            type="button"
          >
            Submit
          </button>
        </div>
      </div>

      {/* Problems */}
      <div className="mt-8 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
        <h3 className="mb-3 font-semibold">❌ Problems with this approach:</h3>
        <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
          <li className="flex items-start gap-2">
            <span className="text-red-500">❌</span>
            <span>
              <strong>focusItself prop:</strong> Only works once (false → true),
              needs hacky reset logic
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-500">❌</span>
            <span>
              <strong>No shake animation:</strong> Can&apos;t trigger CSS animations
              imperatively
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-500">❌</span>
            <span>
              <strong>State-based workaround:</strong> Requires useEffect +
              setTimeout cleanup
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-500">❌</span>
            <span>
              <strong>Parent knows internals:</strong> Form shouldn&apos;t care about
              DOM elements
            </span>
          </li>
        </ul>
      </div>

      {/* Code example */}
      <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
        <h3 className="mb-2 font-semibold">Hacky Focus Pattern:</h3>
        <pre className="overflow-x-auto text-xs text-zinc-600 dark:text-zinc-400">
{`// ❌ This only works ONCE when false → true
const InputField = ({ focusItself }) => {
  const inputRef = useRef(null);
  
  useEffect(() => {
    if (focusItself) {
      inputRef.current?.focus();
    }
  }, [focusItself]);
  
  return <input ref={inputRef} />;
};

// Parent has to do hacky reset:
const Form = () => {
  const [focusName, setFocusName] = useState(false);
  
  useEffect(() => {
    if (focusName) {
      // Reset after focusing - ugly!
      setTimeout(() => setFocusName(false), 100);
    }
  }, [focusName]);
  
  return <InputField focusItself={focusName} />;
};`}
        </pre>
      </div>

      {/* Ref info */}
      <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
        <h3 className="mb-3 font-semibold">Key differences: Ref vs State</h3>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <h4 className="mb-2 font-medium text-blue-500">useState</h4>
            <ul className="space-y-1 text-zinc-500">
              <li>• Triggers re-render on update</li>
              <li>• Update is asynchronous</li>
              <li>• Value available next render</li>
              <li>• Use for UI/rendering data</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-2 font-medium text-amber-500">useRef</h4>
            <ul className="space-y-1 text-zinc-500">
              <li>• NO re-render on update</li>
              <li>• Update is synchronous</li>
              <li>• Value available immediately</li>
              <li>• Use for DOM/non-rendering data</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChapterNine;

