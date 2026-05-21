import { Lightbulb, Plus, Filter } from "lucide-react";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FilterToggle } from "@/components/ui/filter-toggle";
import { SeedsTable } from "./SeedsTable";
import { SeedForm } from "./SeedForm";
import { useViewStore } from "@/stores/viewStore";
import { useSeeds } from "@/hooks/useSeeds";

export function SeedsSection({ className }: { className?: string }) {
  const {
    setSeedFormOpen,
    isSeedFormOpen,
    editingSeed,
    setEditingSeed,
    showArchivedSeeds,
    setShowArchivedSeeds,
  } =
    useViewStore();
  const { data: seeds, isLoading } = useSeeds();
  const archivedCount = (seeds ?? []).filter((seed) => seed.status === "archived").length;
  const visibleSeeds = showArchivedSeeds
    ? (seeds ?? [])
    : (seeds ?? []).filter((seed) => seed.status !== "archived");

  return (
    <Section
      title="Seeds"
      icon={<Lightbulb className="h-5 w-5" />}
      actions={
        <>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={showArchivedSeeds ? "default" : "outline"}
                size="icon"
                className="relative h-8 w-8"
                aria-label="Filter"
              >
                <Filter className="h-3 w-3" />
                {showArchivedSeeds && (
                  <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-60 overflow-hidden p-0">
              <div className="flex items-center gap-2 border-b bg-muted/40 px-3 py-2.5">
                <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-sm font-medium">Filters</span>
                {archivedCount > 0 && (
                  <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium tabular-nums text-muted-foreground">
                    {archivedCount} archived
                  </span>
                )}
              </div>
              <div className="space-y-0.5 p-1.5">
                <p className="px-2 pb-0.5 pt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Show / hide
                </p>
                <FilterToggle
                  id="show-archived-seeds"
                  label="Show archived"
                  checked={showArchivedSeeds}
                  onCheckedChange={setShowArchivedSeeds}
                />
              </div>
            </PopoverContent>
          </Popover>
          <Button size="sm" onClick={() => setSeedFormOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            New Seed
          </Button>
        </>
      }
      className={className}
    >
      <SeedsTable seeds={visibleSeeds} isLoading={isLoading} />

      <SeedForm
        open={isSeedFormOpen}
        onOpenChange={(open) => {
          setSeedFormOpen(open);
          if (!open) setEditingSeed(null);
        }}
        seedId={editingSeed}
      />
    </Section>
  );
}
