import { Lightbulb, Plus, Filter } from "lucide-react";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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
                className="h-8 w-8"
                aria-label="Filter"
              >
                <Filter className="h-3 w-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-56">
              <div className="space-y-3">
                <p className="text-sm font-medium">Filters</p>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="show-archived-seeds"
                    checked={showArchivedSeeds}
                    onCheckedChange={(checked) => setShowArchivedSeeds(checked === true)}
                  />
                  <Label htmlFor="show-archived-seeds" className="text-sm font-normal">
                    Show archived{archivedCount > 0 ? ` (${archivedCount})` : ""}
                  </Label>
                </div>
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
