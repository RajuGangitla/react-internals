"use client";

import { useState } from "react";
import { CodeBlock } from "@/components/ui/code-block";

const ChapterSix = () => {
  const [isCompany, setIsCompany] = useState(false);

  return (
    <div className="layout mx-auto max-w-2xl p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Chapter 6: Diffing & Reconciliation (Problem)</h1>
        <p className="mt-2 text-muted-foreground">
          This example demonstrates a common "bug" where React re-uses an existing component instance because it appears in the same position in the tree, even though logically we think of them as different.
        </p>
        <div className="mt-6">
            <CodeBlock 
                fileName="components/chapter-6/index.tsx"
                code={`
// When isCompany toggles, React compares the element tree:
// Before: <Input /> (at index 0)
// After:  <Input /> (at index 0)

// React sees the SAME component type at the SAME position.
// So it REUSES the existing instance (and its state/DOM value)!
// It just updates the props (id, placeholder).

{isCompany ? (
  <Input id="company-tax-id" placeholder="Company Tax ID" />
) : (
  <Input id="person-tax-id" placeholder="Personal Tax ID" />
)}
                `}
            />
        </div>
        <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-4">
          <p className="text-sm text-red-600 dark:text-red-400">
            <strong>❌ Mystery:</strong> Type something in the "Personal Tax ID" input. Then check "I am a company".
            <br />
            Notice that the text <strong>persists</strong> in the "Company Tax ID" field! React sees them as the same <code>Input</code> component at the same position, so it preserves the state (DOM value).
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-zinc-200 p-6 dark:border-zinc-800">
        <div className="mb-6">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={isCompany}
              onChange={(e) => setIsCompany(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900"
            />
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              I am a company
            </span>
          </label>
        </div>

        <div className="space-y-4">
          {isCompany ? (
            <div>
              <label 
                htmlFor="company-tax-id" 
                className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Company Tax ID
              </label>
              <input
                id="company-tax-id"
                type="text"
                placeholder="Enter company Tax ID (e.g. 12-3456789)"
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
              />
               <p className="mt-1 text-xs text-muted-foreground">
                This should be a completely different field.
              </p>
            </div>
          ) : (
            <div>
              <label 
                htmlFor="person-tax-id" 
                className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Personal Tax ID
              </label>
              <input
                id="person-tax-id"
                type="text"
                placeholder="Enter personal Tax ID (e.g. 123-45-678)"
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Type something here, then toggle the checkbox above.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChapterSix;
