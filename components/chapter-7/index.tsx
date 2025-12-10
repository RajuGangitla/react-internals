"use client";

import { useState, useEffect } from "react";

// Simulated logging system
const useLoggingSystem = () => {
  return (message: string, data?: Record<string, unknown>) => {
    console.log(`📊 [LOG]: ${message}`, data || "");
  };
};

// ❌ Problem: Copy-pasting logging logic in every component

// Button with logging - has its own logging logic
const ButtonWithLogging = ({
  onClick,
  loggingData,
  children,
}: {
  onClick: () => void;
  loggingData: { text: string };
  children: React.ReactNode;
}) => {
  const log = useLoggingSystem();

  const handleClick = () => {
    log("Button was clicked", loggingData);
    onClick();
  };

  return (
    <button
      onClick={handleClick}
      className="rounded-lg bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
      type="button"
    >
      {children}
    </button>
  );
};

// ListItem with logging - SAME logic copy-pasted!
const ListItemWithLogging = ({
  onClick,
  loggingData,
  children,
}: {
  onClick: () => void;
  loggingData: { text: string };
  children: React.ReactNode;
}) => {
  const log = useLoggingSystem();

  // Same logic duplicated here!
  const handleClick = () => {
    log("List item was clicked", loggingData);
    onClick();
  };

  return (
    <li
      onClick={handleClick}
      onKeyDown={(e) => e.key === "Enter" && handleClick()}
      className="cursor-pointer rounded-lg border border-zinc-200 bg-white p-3 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700"
      role="button"
      tabIndex={0}
      aria-label={`Click ${children}`}
    >
      {children}
    </li>
  );
};

// Card with logging - SAME logic copy-pasted again!
const CardWithLogging = ({
  onClick,
  loggingData,
  title,
  description,
}: {
  onClick: () => void;
  loggingData: { text: string };
  title: string;
  description: string;
}) => {
  const log = useLoggingSystem();

  // Same logic duplicated AGAIN!
  const handleClick = () => {
    log("Card was clicked", loggingData);
    onClick();
  };

  return (
    <div
      onClick={handleClick}
      onKeyDown={(e) => e.key === "Enter" && handleClick()}
      className="cursor-pointer rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800"
      role="button"
      tabIndex={0}
      aria-label={`Click ${title}`}
    >
      <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">{title}</h4>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
    </div>
  );
};

// Modal without HOC - manual keyboard event handling
const Modal = ({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) => {
  // Manual keyboard suppression - copy-paste this everywhere?
  const handleKeyPress = (event: React.KeyboardEvent) => {
    event.stopPropagation();
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEscape);
    }
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        onKeyPress={handleKeyPress}
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-zinc-800"
        role="document"
      >
        {children}
      </div>
    </div>
  );
};

// Main component for Chapter 7 - Non-optimised
const ChapterSeven = () => {
  const [clickCount, setClickCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClick = () => {
    setClickCount((prev) => prev + 1);
  };

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  return (
    <div className="layout mx-auto max-w-2xl p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Chapter 7: Higher-Order Components</h1>
        <p className="mt-2 text-muted-foreground">
          This example shows the problem of copy-pasting logging logic across
          multiple components.
        </p>
        <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-4">
          <p className="text-sm text-red-600 dark:text-red-400">
            <strong>❌ Problem:</strong> Each component (Button, ListItem, Card)
            has duplicate logging logic. This is error-prone and hard to maintain.
            Open the console to see the logs.
          </p>
        </div>
      </div>

      {/* Click counter */}
      <div className="mb-6 rounded-lg bg-zinc-100 p-4 dark:bg-zinc-900">
        <p className="text-center text-lg">
          Total clicks: <span className="font-bold text-blue-500">{clickCount}</span>
        </p>
      </div>

      {/* Components with duplicated logging logic */}
      <div className="space-y-6">
        {/* Button */}
        <div>
          <h3 className="mb-2 text-sm font-medium text-zinc-500">Button Component:</h3>
          <ButtonWithLogging
            onClick={handleClick}
            loggingData={{ text: "primary button" }}
          >
            Click Me
          </ButtonWithLogging>
        </div>

        {/* List Items */}
        <div>
          <h3 className="mb-2 text-sm font-medium text-zinc-500">List Items:</h3>
          <ul className="space-y-2">
            <ListItemWithLogging
              onClick={handleClick}
              loggingData={{ text: "list item 1" }}
            >
              📦 Item One
            </ListItemWithLogging>
            <ListItemWithLogging
              onClick={handleClick}
              loggingData={{ text: "list item 2" }}
            >
              📦 Item Two
            </ListItemWithLogging>
          </ul>
        </div>

        {/* Cards */}
        <div>
          <h3 className="mb-2 text-sm font-medium text-zinc-500">Card Components:</h3>
          <div className="grid grid-cols-2 gap-4">
            <CardWithLogging
              onClick={handleClick}
              loggingData={{ text: "feature card" }}
              title="Feature Card"
              description="Click to interact"
            />
            <CardWithLogging
              onClick={handleClick}
              loggingData={{ text: "info card" }}
              title="Info Card"
              description="Another clickable card"
            />
          </div>
        </div>

        {/* Modal */}
        <div>
          <h3 className="mb-2 text-sm font-medium text-zinc-500">Modal (keyboard handling):</h3>
          <button
            onClick={handleOpenModal}
            className="rounded-lg bg-purple-500 px-4 py-2 text-white transition-colors hover:bg-purple-600"
            type="button"
          >
            Open Modal
          </button>
        </div>
      </div>

      {/* Code comparison */}
      <div className="mt-8 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
        <h3 className="mb-2 font-semibold">❌ The Problem:</h3>
        <pre className="overflow-x-auto text-xs text-zinc-600 dark:text-zinc-400">
{`// Same logging logic in EVERY component:

const ButtonWithLogging = ({ onClick, loggingData }) => {
  const log = useLoggingSystem();
  const handleClick = () => {
    log("Button clicked", loggingData); // duplicated!
    onClick();
  };
  return <button onClick={handleClick}>...</button>;
};

const ListItemWithLogging = ({ onClick, loggingData }) => {
  const log = useLoggingSystem();
  const handleClick = () => {
    log("List item clicked", loggingData); // same logic!
    onClick();
  };
  return <li onClick={handleClick}>...</li>;
};`}
        </pre>
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <h2 className="text-xl font-bold">Modal Dialog</h2>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400">
          This modal has manual keyboard event handling. Press Escape to close.
        </p>
        <button
          onClick={handleCloseModal}
          className="mt-4 rounded-lg bg-zinc-200 px-4 py-2 transition-colors hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600"
          type="button"
        >
          Close
        </button>
      </Modal>
    </div>
  );
};

export default ChapterSeven;

