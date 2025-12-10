"use client";

import { useState } from "react";
import { CodeBlock } from "@/components/ui/code-block";

const ChapterSixOptimised = () => {
  const [isCompany, setIsCompany] = useState(false);
  const [isCompany2, setIsCompany2] = useState(false);

  return (
    <div className="layout mx-auto max-w-2xl p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Chapter 6: Diffing & Reconciliation (Optimised)</h1>
        <p className="mt-2 text-muted-foreground">
          Here are two ways to tell React that these are different components, forcing a "State Reset".
        </p>
        <div className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
          <p className="text-sm text-emerald-600 dark:text-emerald-400">
            <strong>✅ Solution:</strong> Use the <code>key</code> attribute OR render components in different positions. This forces React to unmount the old component and mount the new one, resetting the state.
          </p>
        </div>
      </div>

      {/* Solution 1: Using Keys */}
      <div className="mb-8 rounded-lg border border-zinc-200 p-6 dark:border-zinc-800">
        <h2 className="mb-4 text-lg font-semibold">Solution 1: Using Keys</h2>
        <div className="mb-6">
            <CodeBlock 
                code={`
// Adding a key forces React to treat them as different components
// even if they are in the same position!
{isCompany ? (
  <Input key="company" id="company-tax-id" />
) : (
  <Input key="person" id="person-tax-id" />
)}
                `}
                className="mb-4"
            />

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
                htmlFor="company-tax-id-key" 
                className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Company Tax ID
              </label>
              {/* Added key prop */}
              <input
                key="company-tax-id"
                id="company-tax-id-key"
                type="text"
                placeholder="Enter company Tax ID"
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
              />
               <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                Has <code>key=&quot;company-tax-id&quot;</code>
              </p>
            </div>
          ) : (
            <div>
              <label 
                htmlFor="person-tax-id-key" 
                className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Personal Tax ID
              </label>
              {/* Added key prop */}
              <input
                key="person-tax-id"
                id="person-tax-id-key"
                type="text"
                placeholder="Enter personal Tax ID"
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
              />
              <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                Has <code>key=&quot;person-tax-id&quot;</code>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Solution 2: Different Positions */}
      <div className="rounded-lg border border-zinc-200 p-6 dark:border-zinc-800">
        <h2 className="mb-4 text-lg font-semibold">Solution 2: Different Positions (Arrays)</h2>
        <div className="mb-6">
            <CodeBlock 
                code={`
// By using && (conditional rendering), the tree structure changes!
// Case 1: [Input, null]
// Case 2: [null, Input]

// React sees components at different indices (0 vs 1),
// so it unmounts the old one and mounts the new one.
<div>
  {isCompany && <Input id="company-tax-id" />}
  {!isCompany && <Input id="person-tax-id" />}
</div>
                `}
                className="mb-4"
            />
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={isCompany2}
              onChange={(e) => setIsCompany2(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900"
            />
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              I am a company
            </span>
          </label>
        </div>

        <div className="space-y-4">
            {/* 
                By rendering both conditionally, we change the array structure.
                Before: [{type: Checkbox}, {type: Input}, null]
                After:  [{type: Checkbox}, null, {type: Input}]
            */}
            {isCompany2 ? (
                <div>
                <label 
                    htmlFor="company-tax-id-pos" 
                    className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                    Company Tax ID
                </label>
                <input
                    id="company-tax-id-pos"
                    type="text"
                    placeholder="Enter company Tax ID"
                    className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                />
                <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                    Position 1 in the render output
                </p>
                </div>
            ) : null}

            {!isCompany2 ? (
                <div>
                <label 
                    htmlFor="person-tax-id-pos" 
                    className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                    Personal Tax ID
                </label>
                <input
                    id="person-tax-id-pos"
                    type="text"
                    placeholder="Enter personal Tax ID"
                    className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                />
                <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                     Position 2 in the render output
                </p>
                </div>
            ) : null}
        </div>
      </div>
    </div>
  );
};

export default ChapterSixOptimised;
