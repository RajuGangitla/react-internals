import ChapterOne from "@/components/chapter-1";
import ChapterOneOptimised from "@/components/chapter-1/optimised";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <ChapterOne />
      <ChapterOneOptimised />
    </div>
  );
}
