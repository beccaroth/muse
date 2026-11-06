import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { SeedsFilterPopover } from "./SeedsFilterPopover";
import { SeedActionsMenu } from "./SeedsTable";
import { useSeeds } from "@/hooks/useSeeds";
import { useViewStore } from "@/stores/viewStore";
import type { Seed } from "@/types";
import { cn } from "@/lib/utils";

const SEED_SORTS = ["Newest", "Oldest", "Title", "Type"] as const;
type SeedSort = (typeof SEED_SORTS)[number];

function compareSeeds(a: Seed, b: Seed, sort: SeedSort) {
  switch (sort) {
    case "Newest":
      return b.date_added.localeCompare(a.date_added);
    case "Oldest":
      return a.date_added.localeCompare(b.date_added);
    case "Title":
      return a.title.localeCompare(b.title);
    case "Type":
      // Seeds with no type go last, not first.
      if (!a.project_type || !b.project_type) {
        return Number(!a.project_type) - Number(!b.project_type);
      }
      return a.project_type.localeCompare(b.project_type);
  }
}

function SeedRow({ seed, sort }: { seed: Seed; sort: SeedSort }) {
  const isArchived = seed.status === "archived";
  const description = seed.description?.trim();
  // When sorted by type, show the type so the order makes sense.
  const detail = sort === "Type" ? seed.project_type : description || seed.project_type;

  return (
    <li className="flex items-start gap-2.5 border-b py-2 pl-3 pr-1.5 last:border-b-0">
      {seed.icon && (
        <span aria-hidden className="shrink-0 text-lg leading-6">
          {seed.icon}
        </span>
      )}
      <div className="min-w-0 flex-1" title={description}>
        <div
          className={cn(
            "truncate text-sm font-medium",
            isArchived && "text-muted-foreground line-through",
          )}
        >
          {seed.title}
        </div>
        {detail && (
          <div className={cn("truncate text-xs text-muted-foreground", isArchived && "opacity-70")}>
            {detail}
          </div>
        )}
      </div>
      <SeedActionsMenu seed={seed} />
    </li>
  );
}

/** Seeds beside the projects on large screens. Hiding it leaves a slim strip to reopen it. */
export function SeedsRail() {
  const { showSeeds, setShowSeeds, setSeedFormOpen, showArchivedSeeds } = useViewStore();
  const { data: seeds, isLoading } = useSeeds();
  const [sort, setSort] = useState<SeedSort>("Newest");

  const activeCount = (seeds ?? []).filter((seed) => seed.status !== "archived").length;
  const visibleSeeds = (seeds ?? [])
    .filter((seed) => showArchivedSeeds || seed.status !== "archived")
    .sort((a, b) => compareSeeds(a, b, sort));

  // Sticks below the page header. 5.5rem clears the header plus a small gap, and the extra
  // 1rem in max-h leaves the same gap at the bottom of the window.
  const placement = "sticky top-[5.5rem] shrink-0 rounded-xl border bg-card";

  if (!showSeeds) {
    return (
      <aside aria-label="Seeds" className={cn(placement, "flex w-12 flex-col items-center gap-2 py-3")}>
        <Button
          variant="ghost"
          className="h-auto px-1.5 py-2 font-display text-base font-semibold [writing-mode:vertical-rl]"
          aria-label="Show seeds"
          aria-expanded={false}
          onClick={() => setShowSeeds(true)}
        >
          Seeds
        </Button>
        <span className="text-xs tabular-nums text-muted-foreground">{activeCount}</span>
      </aside>
    );
  }

  return (
    <aside
      aria-label="Seeds"
      className={cn(placement, "flex max-h-[calc(100vh-6.5rem)] w-[19.5rem] flex-col")}
    >
      <div className="flex items-center gap-1.5 border-b py-2.5 pl-3 pr-2">
        <h2 className="font-display text-lg font-semibold tracking-tight">Seeds</h2>
        <span className="text-sm tabular-nums text-muted-foreground">{activeCount}</span>
        <Button
          variant="outline"
          size="sm"
          className="ml-auto"
          aria-expanded={true}
          onClick={() => setShowSeeds(false)}
        >
          Hide
        </Button>
        <SeedsFilterPopover id="show-archived-seeds-rail">
          <Separator />
          <div className="px-3 py-2.5">
            <p className="pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Sort by
            </p>
            <div className="grid grid-cols-2 gap-0.5 rounded-lg bg-muted p-0.5">
              {SEED_SORTS.map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-pressed={sort === option}
                  onClick={() => setSort(option)}
                  className={cn(
                    "rounded-md px-2 py-1 text-xs font-medium transition-all",
                    sort === option
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </SeedsFilterPopover>
        <Button size="sm" onClick={() => setSeedFormOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          New
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3 p-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full imagination-skeleton" />
          ))}
        </div>
      ) : visibleSeeds.length === 0 ? (
        <p className="p-4 text-sm text-muted-foreground">
          No seeds yet. Capture your first idea!
        </p>
      ) : (
        <ul className="min-h-0 overflow-y-auto">
          {visibleSeeds.map((seed) => (
            <SeedRow key={seed.id} seed={seed} sort={sort} />
          ))}
        </ul>
      )}
    </aside>
  );
}
