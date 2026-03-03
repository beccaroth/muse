import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus } from 'lucide-react';
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
import { useProjectTypes } from '@/hooks/useProjectTypes';
import { EmojiPicker } from '@/components/projects/EmojiPicker';

const seedSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  icon: z.string().nullable(),
  description: z.string().nullable(),
  project_type: z.string().nullable(),
  status: z.enum(['active', 'archived']),
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
  const { data: sharedProjectTypes } = useProjectTypes();
  const isEditing = !!seedId;
  const [newType, setNewType] = useState('');
  const [customTypes, setCustomTypes] = useState<string[]>([]);

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
      icon: null,
      description: null,
      project_type: null,
      status: 'active',
      date_added: new Date().toISOString().split('T')[0],
    },
  });

  const selectedType = watch('project_type');
  const typeOptions = useMemo(() => {
    const baseTypes = sharedProjectTypes ?? [...DEFAULT_PROJECT_TYPES];
    const dedupedTypes = new Set<string>();

    for (const type of [...baseTypes, ...customTypes]) {
      const trimmedType = type.trim();
      if (trimmedType) {
        dedupedTypes.add(trimmedType);
      }
    }

    if (selectedType?.trim()) {
      dedupedTypes.add(selectedType.trim());
    }

    return Array.from(dedupedTypes);
  }, [customTypes, selectedType, sharedProjectTypes]);

  useEffect(() => {
    if (seed) {
      reset({
        title: seed.title,
        icon: seed.icon,
        description: seed.description,
        project_type: seed.project_type,
        status: seed.status,
        date_added: seed.date_added,
      });
      if (seed.project_type && !(DEFAULT_PROJECT_TYPES as readonly string[]).includes(seed.project_type)) {
        setCustomTypes([seed.project_type]);
      } else {
        setCustomTypes([]);
      }
      setNewType('');
    } else {
      reset({
        title: '',
        icon: null,
        description: null,
        project_type: null,
        status: 'active',
        date_added: new Date().toISOString().split('T')[0],
      });
      setCustomTypes([]);
      setNewType('');
    }
  }, [seed, reset]);

  const addCustomType = () => {
    const trimmedType = newType.trim();
    if (!trimmedType) return;
    if (!typeOptions.includes(trimmedType)) {
      setCustomTypes((current) => [...current, trimmedType]);
    }
    setValue('project_type', trimmedType);
    setNewType('');
  };

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
              <div className="flex gap-2">
                <EmojiPicker
                  value={watch('icon')}
                  onChange={(emoji) => setValue('icon', emoji)}
                />
                <Input id="title" {...register('title')} placeholder="What's your idea?" className="flex-1" />
              </div>
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label>Project Type</Label>
              <Select
                value={selectedType ?? '__none__'}
                onValueChange={(v) => setValue('project_type', v === '__none__' ? null : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">None</SelectItem>
                  {typeOptions.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Input
                  placeholder="Add new project type..."
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomType();
                    }
                  }}
                />
                <Button type="button" variant="outline" size="icon" onClick={addCustomType}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
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
