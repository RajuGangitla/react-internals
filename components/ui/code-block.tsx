import React from "react";
import { cn } from "@/lib/utils";

interface CodeBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  code: string;
  fileName?: string;
  language?: string;
}

export function CodeBlock({
  code,
  fileName,
  language = "typescript",
  className,
  ...props
}: CodeBlockProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950",
        className
      )}
      {...props}
    >
      {fileName && (
        <div className="border-b border-zinc-200 px-4 py-2 text-xs font-medium text-muted-foreground dark:border-zinc-800">
          {fileName}
        </div>
      )}
      <div className="overflow-x-auto p-4">
        <pre className="text-sm font-mono text-zinc-800 dark:text-zinc-200">
          <code>{code.trim()}</code>
        </pre>
      </div>
    </div>
  );
}

