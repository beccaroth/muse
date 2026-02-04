import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Seed, SeedInsert, SeedUpdate } from '@/types';

export function useSeeds() {
  return useQuery({
    queryKey: ['seeds'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('seeds')
        .select('*')
        .order('date_added', { ascending: false });
      if (error) throw error;
      return data as Seed[];
    },
  });
}

export function useSeed(id: string | null) {
  return useQuery({
    queryKey: ['seeds', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('seeds')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as Seed;
    },
    enabled: !!id,
  });
}

export function useCreateSeed() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (seed: SeedInsert) => {
      const { data, error } = await supabase
        .from('seeds')
        .insert(seed)
        .select()
        .single();
      if (error) throw error;
      return data as Seed;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seeds'] });
    },
  });
}

export function useUpdateSeed() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: SeedUpdate) => {
      const { data, error } = await supabase
        .from('seeds')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Seed;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seeds'] });
    },
  });
}

export function useDeleteSeed() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('seeds')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seeds'] });
    },
  });
}
