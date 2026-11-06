import { Lightbulb, Plus } from "lucide-react";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/button";
import { SeedsFilterPopover } from "./SeedsFilterPopover";
import { SeedsTable } from "./SeedsTable";
import { useViewStore } from "@/stores/viewStore";
import { useSeeds } from "@/hooks/useSeeds";

/** Seeds as a full table, for the Seeds tab on phones and tablets. */
export function SeedsSection({ className }: { className?: string }) {
  const { setSeedFormOpen, showArchivedSeeds } = useViewStore();
  const { data: seeds, isLoading } = useSeeds();
  const visibleSeeds = showArchivedSeeds
    ? (seeds ?? [])
    : (seeds ?? []).filter((seed) => seed.status !== "archived");

  return (
    <Section
      title="Seeds"
      icon={<Lightbulb className="h-5 w-5" />}
      actions={
        <>
          <SeedsFilterPopover id="show-archived-seeds" />
          <Button size="sm" onClick={() => setSeedFormOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            New Seed
          </Button>
        </>
      }
      className={className}
    >
      <SeedsTable seeds={visibleSeeds} isLoading={isLoading} />
      {/* SeedForm is mounted once in AuthenticatedLayout via GlobalForms */}
    </Section>
  );
}
