import { FolderKanban, Lightbulb } from "lucide-react";
import { ProjectsSection } from "@/components/projects/ProjectsSection";
import { SeedsRail } from "@/components/seeds/SeedsRail";
import { SeedsSection } from "@/components/seeds/SeedsSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useViewStore } from "@/stores/viewStore";

export function Dashboard() {
  const { mobileDashboardTab, setMobileDashboardTab } = useViewStore();

  return (
    <main className="mx-auto w-full max-w-[96rem] px-4 py-6 lg:px-6">
      {/* Phones and tablets: tabbed layout, since a rail would squeeze the projects */}
      <div className="lg:hidden">
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

      {/* Large screens: projects with the seeds rail beside them */}
      <div className="hidden items-start gap-6 lg:flex">
        <ProjectsSection className="min-w-0 flex-1" />
        <SeedsRail />
      </div>
    </main>
  );
}
