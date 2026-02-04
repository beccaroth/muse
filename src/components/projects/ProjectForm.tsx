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
import { PROJECT_STATUSES, PROJECT_PRIORITIES, PROJECT_TYPES } from '@/lib/constants';
import { useProject, useCreateProject, useUpdateProject } from '@/hooks/useProjects';
import type { ProjectStatus, ProjectPriority, ProjectType } from '@/lib/constants';

const projectSchema = z.object({
  project_name: z.string().min(1, 'Name is required'),
  status: z.enum(PROJECT_STATUSES),
  priority: z.enum(PROJECT_PRIORITIES),
  project_types: z.array(z.enum(PROJECT_TYPES)),
  description: z.string().nullable(),
  start_value: z.coerce.number().min(0),
  end_value: z.coerce.number().min(0),
  current_value: z.coerce.number().min(0),
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
      status: 'Not started',
      priority: 'Someday',
      project_types: [],
      description: null,
      start_value: 0,
      end_value: 100,
      current_value: 0,
      start_date: null,
      end_date: null,
    },
  });

  const selectedTypes = watch('project_types');

  useEffect(() => {
    if (project) {
      reset({
        project_name: project.project_name,
        status: project.status,
        priority: project.priority,
        project_types: project.project_types,
        description: project.description,
        start_value: project.start_value,
        end_value: project.end_value,
        current_value: project.current_value,
        start_date: project.start_date,
        end_date: project.end_date,
      });
    } else {
      reset({
        project_name: '',
        status: 'Not started',
        priority: 'Someday',
        project_types: [],
        description: null,
        start_value: 0,
        end_value: 100,
        current_value: 0,
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

  const toggleType = (type: ProjectType) => {
    const current = selectedTypes || [];
    if (current.includes(type)) {
      setValue('project_types', current.filter((t) => t !== type));
    } else {
      setValue('project_types', [...current, type]);
    }
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
              <Input id="project_name" {...register('project_name')} />
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
                        {status}
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
              <div className="flex flex-wrap gap-2">
                {PROJECT_TYPES.map((type) => (
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
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" {...register('description')} rows={3} />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="start_value">Start</Label>
                <Input id="start_value" type="number" {...register('start_value')} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="current_value">Current</Label>
                <Input id="current_value" type="number" {...register('current_value')} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="end_value">End</Label>
                <Input id="end_value" type="number" {...register('end_value')} />
              </div>
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
