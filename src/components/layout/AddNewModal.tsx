import { FolderKanban, Lightbulb } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useViewStore } from '@/stores/viewStore';

export function AddNewModal() {
  const { isAddNewOpen, setAddNewOpen, setProjectFormOpen, setSeedFormOpen } =
    useViewStore();

  return (
    <Dialog open={isAddNewOpen} onOpenChange={setAddNewOpen}>
      <DialogContent className="max-w-[300px]">
        <DialogHeader>
          <DialogTitle>Create New</DialogTitle>
          <DialogDescription>What would you like to add?</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <Button
            variant="outline"
            className="h-14 justify-start gap-3 text-base"
            onClick={() => {
              setAddNewOpen(false);
              setProjectFormOpen(true);
            }}
          >
            <FolderKanban className="h-5 w-5 text-primary" />
            New Project
          </Button>
          <Button
            variant="outline"
            className="h-14 justify-start gap-3 text-base"
            onClick={() => {
              setAddNewOpen(false);
              setSeedFormOpen(true);
            }}
          >
            <Lightbulb className="h-5 w-5 text-accent" />
            New Seed
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
