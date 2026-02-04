import { Palette, Lightbulb } from 'lucide-react';
import { ProjectsSection } from '@/components/projects/ProjectsSection';
import { SeedsSection } from '@/components/seeds/SeedsSection';
import { Button } from '@/components/ui/button';
import { useViewStore } from '@/stores/viewStore';
import { cn } from '@/lib/utils';

export function Dashboard() {
  const { showSeeds, setShowSeeds } = useViewStore();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Palette className="h-6 w-6" />
            Museboard
          </h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSeeds(!showSeeds)}
            className={cn(!showSeeds && 'text-muted-foreground')}
          >
            <Lightbulb className="h-4 w-4 mr-1" />
            Seeds
          </Button>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6">
        <div className={cn(
          'grid gap-6',
          showSeeds ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
        )}>
          <ProjectsSection />
          {showSeeds && <SeedsSection />}
        </div>
      </main>
    </div>
  );
}
