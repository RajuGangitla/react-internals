"use client";

import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import ChapterOne from "@/components/chapter-1";
import ChapterOneOptimised from "@/components/chapter-1/optimised";
import ChapterTwo from "@/components/chapter-2";
import ChapterTwoOptimised from "@/components/chapter-2/optimised";
import ChapterThree from "@/components/chapter-3";
import ChapterThreeOptimised from "@/components/chapter-3/optimised";
import ChapterFour from "@/components/chapter-4";
import ChapterFourOptimised from "@/components/chapter-4/optimised";
import ChapterFive from "@/components/chapter-5";
import ChapterFiveOptimised from "@/components/chapter-5/optimised";
import ChapterSix from "@/components/chapter-6";
import ChapterSixOptimised from "@/components/chapter-6/optimised";
import ChapterSeven from "@/components/chapter-7";
import ChapterSevenOptimised from "@/components/chapter-7/optimised";

type ChapterItem = {
  id: string;
  title: string;
  description: string;
  nonOptimised: React.ReactNode;
  optimised: React.ReactNode;
};

const chapters: ChapterItem[] = [
  {
    id: "chapter-1",
    title: "Chapter 1",
    description: "Re-renders & State",
    nonOptimised: <ChapterOne />,
    optimised: <ChapterOneOptimised />,
  },
  {
    id: "chapter-2",
    title: "Chapter 2",
    description: "Elements, Children as Props",
    nonOptimised: <ChapterTwo />,
    optimised: <ChapterTwoOptimised />,
  },
  {
    id: "chapter-3",
    title: "Chapter 3",
    description: "Configuration & Elements as Props",
    nonOptimised: <ChapterThree />,
    optimised: <ChapterThreeOptimised />,
  },
  {
    id: "chapter-4",
    title: "Chapter 4",
    description: "Render Props",
    nonOptimised: <ChapterFour />,
    optimised: <ChapterFourOptimised />,
  },
  {
    id: "chapter-5",
    title: "Chapter 5",
    description: "Memoization (useMemo, useCallback)",
    nonOptimised: <ChapterFive />,
    optimised: <ChapterFiveOptimised />,
  },
  {
    id: "chapter-6",
    title: "Chapter 6",
    description: "Diffing & Reconciliation",
    nonOptimised: <ChapterSix />,
    optimised: <ChapterSixOptimised />,
  },
  {
    id: "chapter-7",
    title: "Chapter 7",
    description: "Higher-Order Components",
    nonOptimised: <ChapterSeven />,
    optimised: <ChapterSevenOptimised />,
  },
];

export default function Home() {
  const [activeChapter, setActiveChapter] = useState<string>("chapter-1");

  const handleChapterClick = (chapterId: string) => {
    setActiveChapter(chapterId);
  };

  const handleChapterKeyDown = (e: React.KeyboardEvent, chapterId: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setActiveChapter(chapterId);
    }
  };

  const activeChapterData = chapters.find((ch) => ch.id === activeChapter);

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Sidebar */}
      <aside className="sticky top-0 h-screen w-64 border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
          <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            React Internals
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Advanced React Patterns
          </p>
        </div>

        <ScrollArea className="h-[calc(100vh-80px)]">
          <nav className="p-3" role="navigation" aria-label="Chapter navigation">
            <ul className="space-y-1">
              {chapters.map((chapter) => {
                const isActive = activeChapter === chapter.id;

                return (
                  <li key={chapter.id}>
                    <button
                      onClick={() => handleChapterClick(chapter.id)}
                      onKeyDown={(e) => handleChapterKeyDown(e, chapter.id)}
                      tabIndex={0}
                      aria-label={`${chapter.title}: ${chapter.description}`}
                      aria-current={isActive ? "page" : undefined}
                      className={`
                        w-full rounded-lg px-3 py-3 text-left transition-colors
                        ${isActive
                          ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                          : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        }
                      `}
                    >
                      <span className="font-medium text-sm">{chapter.title}</span>
                      <p
                        className={`
                          mt-1 text-xs
                          ${isActive
                            ? "text-zinc-300 dark:text-zinc-600"
                            : "text-muted-foreground"
                          }
                        `}
                      >
                        {chapter.description}
                      </p>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </ScrollArea>
      </aside>

      {/* Main Content - Shows both non-optimised and optimised */}
      <main className="flex-1 overflow-auto">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-0 divide-y xl:divide-y-0 xl:divide-x divide-zinc-200 dark:divide-zinc-800">
          {/* Non-optimised */}
          <div className="min-h-screen">
            {activeChapterData?.nonOptimised}
          </div>

          {/* Optimised */}
          <div className="min-h-screen">
            {activeChapterData?.optimised}
          </div>
        </div>
      </main>
    </div>
  );
}
