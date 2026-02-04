import { Lightbulb, Plus } from 'lucide-react';
import { Section } from '@/components/layout/Section';
import { Button } from '@/components/ui/button';
import { SeedsTable } from './SeedsTable';
import { SeedForm } from './SeedForm';
import { useViewStore } from '@/stores/viewStore';
import { useSeeds } from '@/hooks/useSeeds';

export function SeedsSection() {
  const { setSeedFormOpen, isSeedFormOpen, editingSeed, setEditingSeed } = useViewStore();
  const { data: seeds, isLoading } = useSeeds();

  return (
    <Section
      title="Seeds"
      icon={<Lightbulb className="h-5 w-5" />}
      actions={
        <Button size="sm" onClick={() => setSeedFormOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          New Seed
        </Button>
      }
    >
      <SeedsTable seeds={seeds ?? []} isLoading={isLoading} />

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
