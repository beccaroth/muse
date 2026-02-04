import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DEFAULT_PROJECT_TYPES } from '@/lib/constants';
import { useSeed, useCreateSeed, useUpdateSeed } from '@/hooks/useSeeds';

const seedSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().nullable(),
  project_type: z.string().nullable(),
  date_added: z.string(),
});

type SeedFormData = z.infer<typeof seedSchema>;

interface SeedFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  seedId: string | null;
}

export function SeedForm({ open, onOpenChange, seedId }: SeedFormProps) {
  const { data: seed } = useSeed(seedId);
  const createSeed = useCreateSeed();
  const updateSeed = useUpdateSeed();
  const isEditing = !!seedId;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<SeedFormData>({
    resolver: zodResolver(seedSchema),
    defaultValues: {
      title: '',
      description: null,
      project_type: null,
      date_added: new Date().toISOString().split('T')[0],
    },
  });

  useEffect(() => {
    if (seed) {
      reset({
        title: seed.title,
        description: seed.description,
        project_type: seed.project_type,
        date_added: seed.date_added,
      });
    } else {
      reset({
        title: '',
        description: null,
        project_type: null,
        date_added: new Date().toISOString().split('T')[0],
      });
    }
  }, [seed, reset]);

  const onSubmit = async (data: SeedFormData) => {
    if (isEditing) {
      await updateSeed.mutateAsync({ id: seedId, ...data });
    } else {
      await createSeed.mutateAsync(data);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Seed' : 'New Seed'}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" {...register('title')} placeholder="What's your idea?" />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label>Project Type</Label>
              <Select
                value={watch('project_type') ?? ''}
                onValueChange={(v) => setValue('project_type', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {DEFAULT_PROJECT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register('description')}
                rows={3}
                placeholder="Describe your idea..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createSeed.isPending || updateSeed.isPending}>
              {isEditing ? 'Save Changes' : 'Create Seed'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
