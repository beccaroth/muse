import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Search } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { STATUS_DOT_COLORS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Kbd } from '@/components/ui/kbd';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const { data: projects } = useProjects();
  const navigate = useNavigate();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  function handleSelect(projectId: string) {
    setOpen(false);
    navigate({ to: '/project/$projectId', params: { projectId } });
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="group hidden sm:flex items-center gap-2 text-muted-foreground font-normal h-8 pr-2"
        onClick={() => setOpen(true)}
      >
        <Search className="h-3.5 w-3.5" />
        <span className="text-xs">Search projects...</span>
        <Kbd className="ml-1 group-hover:bg-accent-foreground/15 group-hover:text-accent-foreground">⌘K</Kbd>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="sm:hidden"
        onClick={() => setOpen(true)}
        aria-label="Search projects"
      >
        <Search className="h-4 w-4" />
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Search Projects"
        description="Search for a project to open"
      >
        <CommandInput placeholder="Search projects..." />
        <CommandList>
          <CommandEmpty>No projects found.</CommandEmpty>
          <CommandGroup heading="Projects">
            {projects?.map((project) => (
              <CommandItem
                key={project.id}
                value={project.project_name}
                onSelect={() => handleSelect(project.id)}
              >
                <span className="text-base leading-none">
                  {project.icon || '📁'}
                </span>
                <span>{project.project_name}</span>
                <span
                  className={`ml-auto h-2 w-2 rounded-full ${STATUS_DOT_COLORS[project.status]}`}
                />
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
