import { FolderKanban, Lightbulb } from "lucide-react";
import { ProjectsSection } from "@/components/projects/ProjectsSection";
import { SeedsSection } from "@/components/seeds/SeedsSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useViewStore } from "@/stores/viewStore";
import { cn } from "@/lib/utils";

export function Dashboard() {
  const { showSeeds, setShowSeeds, mobileDashboardTab, setMobileDashboardTab } =
    useViewStore();

  return (
    <main className="container mx-auto px-4 py-6">
      {/* Mobile: tabbed layout for Projects / Seeds */}
      <div className="sm:hidden">
        <Tabs
          value={mobileDashboardTab}
          onValueChange={(v) =>
            setMobileDashboardTab(v as "projects" | "seeds")
          }
        >
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
        <div className="grid grid-cols-12 gap-6">
          <ProjectsSection
            className={cn(!showSeeds ? "col-span-12" : "col-span-8")}
          />
          {showSeeds && <SeedsSection className="col-span-4" />}
        </div>
      </div>
    </main>
  );
}
