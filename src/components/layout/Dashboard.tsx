import { ProjectsSection } from '@/components/projects/ProjectsSection';
import { SeedsSection } from '@/components/seeds/SeedsSection';
import { useViewStore } from '@/stores/viewStore';
import { cn } from '@/lib/utils';

export function Dashboard() {
  const { showSeeds } = useViewStore();

  return (
    <main className="container mx-auto px-4 py-6">
      <div className={cn(
        'grid gap-6',
        showSeeds ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
      )}>
        <ProjectsSection />
        {showSeeds && <SeedsSection />}
      </div>
    </main>
  );
}
