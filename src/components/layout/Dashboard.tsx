import { ProjectsSection } from '@/components/projects/ProjectsSection';
import { SeedsSection } from '@/components/seeds/SeedsSection';

export function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Projects Dashboard</h1>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ProjectsSection />
          <SeedsSection />
        </div>
      </main>
    </div>
  );
}
