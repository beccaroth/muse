import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Search } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { STATUS_DOT_COLORS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
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
        className="hidden sm:flex items-center gap-2 text-muted-foreground font-normal h-8"
        onClick={() => setOpen(true)}
      >
        <Search className="h-3.5 w-3.5" />
        <span className="text-xs">Search projects...</span>
        <kbd className="pointer-events-none ml-2 hidden select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
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
