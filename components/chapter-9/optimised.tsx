"use client";

import {
  useState,
  useRef,
  useImperativeHandle,
  forwardRef,
  useEffect,
} from "react";

// ===========================================
// IMPERATIVE API TYPE
// ===========================================

type InputFieldAPI = {
  focus: () => void;
  shake: () => void;
  clear: () => void;
};

// ===========================================
// METHOD 1: Using forwardRef + useImperativeHandle
// ===========================================

const InputFieldWithForwardRef = forwardRef<
  InputFieldAPI,
  { label: string; onChange: (value: string) => void }
>(({ label, onChange }, ref) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [shouldShake, setShouldShake] = useState(false);

  // Expose imperative API via ref
  useImperativeHandle(
    ref,
    () => ({
      focus: () => {
        inputRef.current?.focus();
      },
      shake: () => {
        setShouldShake(true);
      },
      clear: () => {
        if (inputRef.current) {
          inputRef.current.value = "";
          onChange("");
        }
      },
    }),
    [onChange]
  );

  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
        {label}
      </label>
      <input
        ref={inputRef}
        type="text"
        onChange={(e) => onChange(e.target.value)}
        onAnimationEnd={() => setShouldShake(false)}
        className={`w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-600 dark:bg-zinc-800 ${
          shouldShake ? "animate-shake" : ""
        }`}
      />
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
          border-color: #ef4444 !important;
        }
      `}</style>
    </div>
  );
});
InputFieldWithForwardRef.displayName = "InputFieldWithForwardRef";

// ===========================================
// METHOD 2: Using apiRef prop (no forwardRef needed)
// ===========================================

const InputFieldWithApiRef = ({
  label,
  onChange,
  apiRef,
}: {
  label: string;
  onChange: (value: string) => void;
  apiRef: React.MutableRefObject<InputFieldAPI | null>;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [shouldShake, setShouldShake] = useState(false);

  // Manually attach API to the ref (same as useImperativeHandle under the hood)
  useEffect(() => {
    apiRef.current = {
      focus: () => {
        inputRef.current?.focus();
      },
      shake: () => {
        setShouldShake(true);
      },
      clear: () => {
        if (inputRef.current) {
          inputRef.current.value = "";
          onChange("");
        }
      },
    };
  }, [apiRef, onChange]);

  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
        {label}
      </label>
      <input
        ref={inputRef}
        type="text"
        onChange={(e) => onChange(e.target.value)}
        onAnimationEnd={() => setShouldShake(false)}
        className={`w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-600 dark:bg-zinc-800 ${
          shouldShake ? "animate-shake" : ""
        }`}
      />
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
          border-color: #ef4444 !important;
        }
      `}</style>
    </div>
  );
};

// ===========================================
// METHOD 3: Passing ref as prop to DOM element
// ===========================================

const InputFieldWithRefProp = ({
  label,
  onChange,
  inputRef,
}: {
  label: string;
  onChange: (value: string) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}) => {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
        {label}
      </label>
      <input
        ref={inputRef}
        type="text"
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-600 dark:bg-zinc-800"
      />
    </div>
  );
};

// ===========================================
// MAIN COMPONENT
// ===========================================

const ChapterNineOptimised = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [twitter, setTwitter] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  // Method 1: forwardRef
  const nameRef = useRef<InputFieldAPI>(null);

  // Method 2: apiRef prop
  const emailRef = useRef<InputFieldAPI | null>(null);

  // Method 3: Direct DOM ref
  const twitterRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    const newErrors: string[] = [];

    if (!name.trim()) {
      newErrors.push("Name is required");
      // Use imperative API - clean and simple!
      nameRef.current?.focus();
      nameRef.current?.shake();
    } else if (!email.trim()) {
      newErrors.push("Email is required");
      emailRef.current?.focus();
      emailRef.current?.shake();
    }

    setErrors(newErrors);

    if (newErrors.length === 0) {
      setSubmitted(true);
      // Clear all fields using imperative API
      nameRef.current?.clear();
      emailRef.current?.clear();
      if (twitterRef.current) {
        twitterRef.current.value = "";
      }
      setName("");
      setEmail("");
      setTwitter("");
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setErrors([]);
  };

  return (
    <div className="layout mx-auto max-w-2xl p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">
          Chapter 9: Refs & Imperative API (Optimised)
        </h1>
        <p className="mt-2 text-muted-foreground">
          This example demonstrates proper use of Refs, forwardRef, and
          useImperativeHandle for clean imperative APIs.
        </p>
        <div className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
          <p className="text-sm text-emerald-600 dark:text-emerald-400">
            <strong>✅ Solution:</strong> Using useImperativeHandle to expose
            focus() and shake() methods. Parent just calls
            inputRef.current.shake()!
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
        <h2 className="mb-4 text-lg font-semibold">Sign Up Form</h2>

        {submitted && (
          <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-800 dark:bg-emerald-900/20">
            <p className="text-sm text-emerald-600 dark:text-emerald-400">
              ✅ Form submitted successfully!
            </p>
            <button
              onClick={handleReset}
              className="mt-2 text-xs text-emerald-500 underline"
              type="button"
            >
              Submit another
            </button>
          </div>
        )}

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
          {/* Method 1: forwardRef + useImperativeHandle */}
          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400">
                forwardRef
              </span>
            </div>
            <InputFieldWithForwardRef
              ref={nameRef}
              label="Name *"
              onChange={setName}
            />
          </div>

          {/* Method 2: apiRef prop */}
          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/50 dark:text-blue-400">
                apiRef prop
              </span>
            </div>
            <InputFieldWithApiRef
              apiRef={emailRef}
              label="Email *"
              onChange={setEmail}
            />
          </div>

          {/* Method 3: Direct ref prop */}
          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className="rounded bg-purple-100 px-1.5 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900/50 dark:text-purple-400">
                inputRef prop
              </span>
            </div>
            <InputFieldWithRefProp
              inputRef={twitterRef}
              label="Twitter (optional)"
              onChange={setTwitter}
            />
          </div>

          <button
            onClick={handleSubmit}
            className="w-full rounded-lg bg-emerald-500 py-2 text-white transition-colors hover:bg-emerald-600"
            type="button"
          >
            Submit
          </button>

          {/* Demo buttons */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => {
                nameRef.current?.shake();
                emailRef.current?.shake();
              }}
              className="flex-1 rounded-lg border border-zinc-300 py-1 text-xs text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-400 dark:hover:bg-zinc-700"
              type="button"
            >
              Shake All
            </button>
            <button
              onClick={() => twitterRef.current?.focus()}
              className="flex-1 rounded-lg border border-zinc-300 py-1 text-xs text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-400 dark:hover:bg-zinc-700"
              type="button"
            >
              Focus Twitter (DOM ref)
            </button>
          </div>
        </div>
      </div>

      {/* Three Methods */}
      <div className="mt-8 space-y-4">
        <h3 className="font-semibold">Three Ways to Pass Refs:</h3>

        {/* Method 1 */}
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-900/20">
          <h4 className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
            1. forwardRef + useImperativeHandle
          </h4>
          <pre className="mt-2 overflow-x-auto text-xs text-emerald-600 dark:text-emerald-500">
{`const InputField = forwardRef((props, ref) => {
  const inputRef = useRef(null);
  
  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    shake: () => setShouldShake(true),
  }), []);
  
  return <input ref={inputRef} />;
});

// Usage
<InputField ref={nameRef} />
nameRef.current.focus();`}
          </pre>
        </div>

        {/* Method 2 */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
          <h4 className="text-sm font-medium text-blue-700 dark:text-blue-400">
            2. apiRef prop (manual assignment)
          </h4>
          <pre className="mt-2 overflow-x-auto text-xs text-blue-600 dark:text-blue-500">
{`const InputField = ({ apiRef }) => {
  useEffect(() => {
    apiRef.current = {
      focus: () => inputRef.current?.focus(),
      shake: () => setShouldShake(true),
    };
  }, [apiRef]);
  
  return <input ref={inputRef} />;
};

// Usage
<InputField apiRef={emailRef} />
emailRef.current.focus();`}
          </pre>
        </div>

        {/* Method 3 */}
        <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-900/20">
          <h4 className="text-sm font-medium text-purple-700 dark:text-purple-400">
            3. Direct ref prop (exposes DOM element)
          </h4>
          <pre className="mt-2 overflow-x-auto text-xs text-purple-600 dark:text-purple-500">
{`const InputField = ({ inputRef }) => {
  // Just pass ref to DOM element
  return <input ref={inputRef} />;
};

// Usage - parent has direct DOM access
<InputField inputRef={twitterRef} />
twitterRef.current.focus(); // native DOM API`}
          </pre>
        </div>
      </div>

      {/* When to use */}
      <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
        <h3 className="mb-3 font-semibold">When to use each method:</h3>
        <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
          <li className="flex items-start gap-2">
            <span className="text-emerald-500">✓</span>
            <span>
              <strong>forwardRef:</strong> Library components, when you want
              standard ref={} syntax
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500">✓</span>
            <span>
              <strong>apiRef prop:</strong> Internal components, simpler to
              understand, no forwardRef needed
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-500">✓</span>
            <span>
              <strong>inputRef prop:</strong> When parent needs direct DOM
              access (measure size, scroll, etc.)
            </span>
          </li>
        </ul>
      </div>

      {/* Use cases */}
      <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
        <h3 className="mb-3 font-semibold">Common Ref Use Cases:</h3>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="rounded bg-zinc-100 p-2 dark:bg-zinc-800">
            <strong>Focus management</strong>
            <p className="text-zinc-500">element.focus()</p>
          </div>
          <div className="rounded bg-zinc-100 p-2 dark:bg-zinc-800">
            <strong>Scroll to element</strong>
            <p className="text-zinc-500">element.scrollIntoView()</p>
          </div>
          <div className="rounded bg-zinc-100 p-2 dark:bg-zinc-800">
            <strong>Measure dimensions</strong>
            <p className="text-zinc-500">element.getBoundingClientRect()</p>
          </div>
          <div className="rounded bg-zinc-100 p-2 dark:bg-zinc-800">
            <strong>Detect outside click</strong>
            <p className="text-zinc-500">element.contains(target)</p>
          </div>
          <div className="rounded bg-zinc-100 p-2 dark:bg-zinc-800">
            <strong>Trigger animations</strong>
            <p className="text-zinc-500">element.animate()</p>
          </div>
          <div className="rounded bg-zinc-100 p-2 dark:bg-zinc-800">
            <strong>Media controls</strong>
            <p className="text-zinc-500">video.play() / audio.pause()</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChapterNineOptimised;

