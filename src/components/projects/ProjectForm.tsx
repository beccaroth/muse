import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Plus } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PROJECT_STATUSES, PROJECT_PRIORITIES, DEFAULT_PROJECT_TYPES } from '@/lib/constants';
import { useProject, useCreateProject, useUpdateProject } from '@/hooks/useProjects';
import { StatusDot } from './StatusDot';
import { EmojiPicker } from './EmojiPicker';
import type { ProjectStatus, ProjectPriority } from '@/lib/constants';

const projectSchema = z.object({
  project_name: z.string().min(1, 'Name is required'),
  icon: z.string().nullable(),
  status: z.enum(PROJECT_STATUSES),
  priority: z.enum(PROJECT_PRIORITIES),
  project_types: z.array(z.string()),
  description: z.string().nullable(),
  progress: z.coerce.number().min(0).max(100),
  start_date: z.string().nullable(),
  end_date: z.string().nullable(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string | null;
}

export function ProjectForm({ open, onOpenChange, projectId }: ProjectFormProps) {
  const { data: project } = useProject(projectId);
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const isEditing = !!projectId;
  const [newType, setNewType] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema) as never,
    defaultValues: {
      project_name: '',
      icon: null,
      status: 'Not started',
      priority: 'Someday',
      project_types: [],
      description: null,
      progress: 0,
      start_date: null,
      end_date: null,
    },
  });

  const selectedTypes = watch('project_types');

  useEffect(() => {
    if (project) {
      reset({
        project_name: project.project_name,
        icon: project.icon,
        status: project.status,
        priority: project.priority,
        project_types: project.project_types,
        description: project.description,
        progress: project.progress,
        start_date: project.start_date,
        end_date: project.end_date,
      });
    } else {
      reset({
        project_name: '',
        icon: null,
        status: 'Not started',
        priority: 'Someday',
        project_types: [],
        description: null,
        progress: 0,
        start_date: null,
        end_date: null,
      });
    }
  }, [project, reset]);

  const onSubmit = async (data: ProjectFormData) => {
    if (isEditing) {
      await updateProject.mutateAsync({ id: projectId, ...data });
    } else {
      await createProject.mutateAsync(data);
    }
    onOpenChange(false);
  };

  const toggleType = (type: string) => {
    const current = selectedTypes || [];
    if (current.includes(type)) {
      setValue('project_types', current.filter((t) => t !== type));
    } else {
      setValue('project_types', [...current, type]);
    }
  };

  const addCustomType = () => {
    if (newType.trim() && !selectedTypes?.includes(newType.trim())) {
      setValue('project_types', [...(selectedTypes || []), newType.trim()]);
      setNewType('');
    }
  };

  const removeType = (type: string) => {
    setValue('project_types', (selectedTypes || []).filter((t) => t !== type));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit(onSubmit as never)}>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Project' : 'New Project'}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="project_name">Name</Label>
              <div className="flex gap-2">
                <EmojiPicker
                  value={watch('icon')}
                  onChange={(emoji) => setValue('icon', emoji)}
                />
                <Input id="project_name" {...register('project_name')} className="flex-1" />
              </div>
              {errors.project_name && (
                <p className="text-sm text-destructive">{errors.project_name.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select
                  value={watch('status')}
                  onValueChange={(v) => setValue('status', v as ProjectStatus)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROJECT_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        <span className="flex items-center gap-2">
                          <StatusDot status={status} />
                          {status}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Priority</Label>
                <Select
                  value={watch('priority')}
                  onValueChange={(v) => setValue('priority', v as ProjectPriority)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROJECT_PRIORITIES.map((priority) => (
                      <SelectItem key={priority} value={priority}>
                        {priority}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Project Types</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {DEFAULT_PROJECT_TYPES.map((type) => (
                  <Button
                    key={type}
                    type="button"
                    variant={selectedTypes?.includes(type) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleType(type)}
                  >
                    {type}
                  </Button>
                ))}
              </div>
              {selectedTypes && selectedTypes.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {selectedTypes.map((type) => (
                    <Badge key={type} variant="secondary" className="gap-1">
                      {type}
                      <button
                        type="button"
                        onClick={() => removeType(type)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  placeholder="Add custom type..."
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
              <Textarea id="description" {...register('description')} rows={3} />
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="progress">Progress</Label>
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={watch('progress') || 0}
                    onChange={(e) => {
                      const value = parseInt(e.target.value, 10);
                      if (!isNaN(value)) {
                        setValue('progress', Math.max(0, Math.min(100, value)));
                      }
                    }}
                    className="w-16 h-7 text-sm text-right pr-1"
                  />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
              </div>
              <Input
                id="progress"
                type="range"
                min="0"
                max="100"
                {...register('progress')}
                className="h-2 cursor-pointer"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createProject.isPending || updateProject.isPending}>
              {isEditing ? 'Save Changes' : 'Create Project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
