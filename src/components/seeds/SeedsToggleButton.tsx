import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Lightbulb } from "lucide-react";
import { useViewStore } from "@/stores/viewStore";

export default function SeedsToggleButton({
  className,
}: {
  className?: string;
}) {
  const { showSeeds, setShowSeeds } = useViewStore();

  return (
    <Button
      variant="outline"
      size="sm"
      className={cn("group", className)}
      onClick={() => setShowSeeds(!showSeeds)}
    >
      <Lightbulb
        className={cn(
          "h-4 w-4 mr-1 transition-all",
          showSeeds &&
            "text-accent group-hover:text-accent-foreground drop-shadow-[0_0_4px_oklch(0.75_0.18_55/0.6)]",
        )}
      />
      {showSeeds ? "Hide Seeds" : "Show Seeds"}
    </Button>
  );
}
