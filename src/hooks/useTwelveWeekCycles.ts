import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { TwelveWeekCycle, TwelveWeekCycleInsert, TwelveWeekCycleUpdate } from '@/types';

export function useTwelveWeekCycles() {
  return useQuery({
    queryKey: ['twelve-week-cycles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('twelve_week_cycles')
        .select('*')
        .order('start_date', { ascending: false });
      if (error) throw error;
      return data as TwelveWeekCycle[];
    },
  });
}

export function useActiveCycle() {
  return useQuery({
    queryKey: ['twelve-week-cycles', 'active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('twelve_week_cycles')
        .select('*')
        .eq('is_active', true)
        .maybeSingle();
      if (error) throw error;
      return data as TwelveWeekCycle | null;
    },
  });
}

export function useCreateCycle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (cycle: TwelveWeekCycleInsert) => {
      // Deactivate any currently active cycle
      if (cycle.is_active) {
        await supabase
          .from('twelve_week_cycles')
          .update({ is_active: false })
          .eq('is_active', true);
      }
      const { data, error } = await supabase
        .from('twelve_week_cycles')
        .insert(cycle)
        .select()
        .single();
      if (error) throw error;
      return data as TwelveWeekCycle;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['twelve-week-cycles'] });
    },
  });
}

export function useUpdateCycle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: TwelveWeekCycleUpdate) => {
      // If setting as active, deactivate others
      if (updates.is_active) {
        await supabase
          .from('twelve_week_cycles')
          .update({ is_active: false })
          .eq('is_active', true)
          .neq('id', id);
      }
      const { data, error } = await supabase
        .from('twelve_week_cycles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as TwelveWeekCycle;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['twelve-week-cycles'] });
    },
  });
}

export function useDeleteCycle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('twelve_week_cycles')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['twelve-week-cycles'] });
    },
  });
}
