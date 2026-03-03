import { Lightbulb, Plus, Eye, EyeOff } from "lucide-react";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/button";
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
          {archivedCount > 0 && (
            <Button
              variant={showArchivedSeeds ? "default" : "outline"}
              size="sm"
              onClick={() => setShowArchivedSeeds(!showArchivedSeeds)}
            >
              {showArchivedSeeds ? (
                <EyeOff className="h-4 w-4 mr-1" />
              ) : (
                <Eye className="h-4 w-4 mr-1" />
              )}
              {showArchivedSeeds
                ? "Hide archived"
                : `Show archived (${archivedCount})`}
            </Button>
          )}
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
