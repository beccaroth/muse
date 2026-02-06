import { FolderKanban, Lightbulb } from 'lucide-react';
import { ProjectsSection } from '@/components/projects/ProjectsSection';
import { SeedsSection } from '@/components/seeds/SeedsSection';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useViewStore } from '@/stores/viewStore';
import { cn } from '@/lib/utils';

export function Dashboard() {
  const { showSeeds, setShowSeeds, mobileDashboardTab, setMobileDashboardTab } = useViewStore();

  return (
    <main className="container mx-auto px-4 py-6">
      {/* Mobile: tabbed layout for Projects / Seeds */}
      <div className="sm:hidden">
        <Tabs value={mobileDashboardTab} onValueChange={(v) => setMobileDashboardTab(v as 'projects' | 'seeds')}>
          <TabsList className="w-full mb-4">
            <TabsTrigger value="projects" className="flex-1">
              <FolderKanban className="h-4 w-4 mr-1.5" />
              Projects
            </TabsTrigger>
            <TabsTrigger value="seeds" className="flex-1">
              <Lightbulb className="h-4 w-4 mr-1.5" />
              Seeds
            </TabsTrigger>
          </TabsList>
          <TabsContent value="projects">
            <ProjectsSection />
          </TabsContent>
          <TabsContent value="seeds">
            <SeedsSection />
          </TabsContent>
        </Tabs>
      </div>

      {/* Desktop: side-by-side layout */}
      <div className="hidden sm:block">
        <div className="flex justify-end mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSeeds(!showSeeds)}
            className={cn(
              'transition-all',
              showSeeds
                ? 'text-accent-foreground bg-accent/50'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Lightbulb className={cn("h-4 w-4 mr-1 transition-all", showSeeds && "text-accent drop-shadow-[0_0_4px_oklch(0.75_0.18_55/0.6)]")} />
            Seeds
          </Button>
        </div>
        <div className={cn(
          'grid gap-6',
          showSeeds ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
        )}>
          <ProjectsSection />
          {showSeeds && <SeedsSection />}
        </div>
      </div>
    </main>
  );
}
