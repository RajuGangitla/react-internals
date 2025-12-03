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

// ModalDialog - a simple dialog component
type ModalDialogProps = {
  onClose: () => void;
};

const ModalDialog = ({ onClose }: ModalDialogProps) => {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Example Modal Dialog</DialogTitle>
          <DialogDescription>
            This is a modal dialog from Chapter 1. Notice how opening and
            closing this dialog causes the VerySlowComponent to re-render!
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            The key insight here is that when <code className="rounded bg-muted px-1 py-0.5 text-xs">isOpen</code> state changes in
            the parent App component, React re-renders the entire component tree
            including the slow component.
          </p>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            aria-label="Close dialog"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Main App component for Chapter 1
const ChapterOne = () => {
  // Add some state
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenDialog = () => {
    setIsOpen(true);
  };

  const handleCloseDialog = () => {
    setIsOpen(false);
  };

  return (
    <div className="layout mx-auto max-w-2xl p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Chapter 1: Re-renders</h1>
        <p className="mt-2 text-muted-foreground">
          This example demonstrates how state changes trigger re-renders in
          React.
        </p>
      </div>

      {/* Add the button */}
      <Button
        onClick={handleOpenDialog}
        aria-label="Open dialog"
        tabIndex={0}
      >
        Open dialog
      </Button>

      {/* Add the dialog itself */}
      {isOpen ? <ModalDialog onClose={handleCloseDialog} /> : null}

      <VerySlowComponent />
    </div>
  );
};

export default ChapterOne;

