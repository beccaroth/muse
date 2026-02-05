import { Link } from '@tanstack/react-router';
import { Palette, Lightbulb, Monitor, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useViewStore } from '@/stores/viewStore';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/useTheme';

export function Header() {
  const { showSeeds, setShowSeeds } = useViewStore();
  const { theme, setTheme } = useTheme();

  return (
    <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="text-xl sm:text-2xl font-bold flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Palette className="h-6 w-6 text-primary" />
          <span className="spark-text">Museboard</span>
        </Link>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Theme">
                {theme === 'system' && <Monitor className="h-4 w-4" />}
                {theme === 'light' && <Sun className="h-4 w-4" />}
                {theme === 'dark' && <Moon className="h-4 w-4" />}
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuRadioGroup
                value={theme}
                onValueChange={(value) => setTheme(value as typeof theme)}
              >
                <DropdownMenuRadioItem value="system">
                  <Monitor className="h-4 w-4" />
                  System
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="light">
                  <Sun className="h-4 w-4" />
                  Light
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="dark">
                  <Moon className="h-4 w-4" />
                  Dark
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
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
            <Lightbulb className={cn("h-4 w-4 sm:mr-1 transition-all", showSeeds && "text-accent drop-shadow-[0_0_4px_oklch(0.75_0.18_55/0.6)]")} />
            <span className="hidden sm:inline">Seeds</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
