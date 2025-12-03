"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ButtonWithDialog from "./button-with-dialog";

// VerySlowComponent - simulates a slow rendering component
// This demonstrates how state changes in parent affect child re-renders
const VerySlowComponent = () => {
  // Simulate slow rendering by doing some heavy computation
  const startTime = performance.now();
  while (performance.now() - startTime < 100) {
    // Artificial delay - blocking for 100ms
  }

  return (
    <div className="mt-8 rounded-lg border border-dashed border-amber-500/50 bg-amber-500/10 p-6">
      <h3 className="text-lg font-semibold text-amber-600 dark:text-amber-400">
        🐢 VerySlowComponent
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">
        This component takes ~100ms to render. Notice how it re-renders every
        time you open/close the dialog because the parent state changes!
      </p>
      <p className="mt-2 text-xs text-amber-600/70 dark:text-amber-400/70">
        Rendered at: {new Date().toLocaleTimeString()}
      </p>
    </div>
  );
};

// Main App component for Chapter 1
const ChapterOneOptimised = () => {
  return (
    <div className="layout mx-auto max-w-2xl p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Chapter 1: Re-renders (Optimised)</h1>
        <p className="mt-2 text-muted-foreground">
          This example demonstrates how state changes trigger re-renders in
          React.
        </p>
      </div>
      <ButtonWithDialog />
      <VerySlowComponent />
    </div>
  );
};

export default ChapterOneOptimised;

